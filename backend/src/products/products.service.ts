import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async getAccessFilters(isPublic: boolean, userContext?: { id: string; role: string }, vendorId?: string) {
    const filters: any = { }; 
    if (isPublic) {
      filters.isActive = true;
    }
    else if (!isPublic && userContext?.role === 'vendor') {
      const vendorProfile = await this.prisma.vendor.findUnique({
        where: { userId: userContext.id },
        select: { id: true },
      });
      if (!vendorProfile) throw new ForbiddenException('Vendor profile not found.');
      filters.vendorId = vendorProfile.id; // Lockdown to own store
    } else if (vendorId) {
      filters.vendorId = vendorId; // Admin/Public can filter by specific store
    }
    return filters;
  }

  // --- FIND ALL PRODUCTS ---
async findAll(params: {
    categoryName?: string;
    vendorId?: string;
    limit?: number;
    offset?: number;
    title?: string;
    storeInfo?: {
      name?: string;
      address?: string;
      contact?: string;
    };
    includeInactive?: boolean; // True for admin/vendor dashboards
  } = {},
   isPublic : boolean = false,
   userContext?:{id:string; role:string}
) {
  const { categoryName, vendorId, limit = 20, offset = 0, title, storeInfo, includeInactive = false } = params;
  const accessFilters = await this.getAccessFilters(isPublic, userContext, vendorId);
  let finalVendorId = vendorId;

  if (isPublic && userContext?.role === 'vendor'){
    const vendorProfile = await this.prisma.vendor.findUnique({
      where:{userId : userContext.id},
      select: {id: true },
    });

    if(!vendorProfile){
      throw new ForbiddenException('Vendor Profile not found for this account.');
    }
    //force vendor to only see their own products, ignoring any passed vendor id
    finalVendorId = vendorProfile.id;
  }

    return this.prisma.product.findMany({
      where: {
        ...accessFilters,
        // Public users only see Admin-approved active products
        ...(!includeInactive && { isActive: true }),
        ...(categoryName && {
          category: {
            name: { contains: categoryName, mode: 'insensitive' },
          },
        }),
        ...(!finalVendorId && {vendorId : finalVendorId}),
        ...(storeInfo && {
          vendor: {
            ...(storeInfo.name && { storeName: { contains: storeInfo.name, mode: 'insensitive' } }),
            ...(storeInfo.address && { address: { contains: storeInfo.address, mode: 'insensitive' } }),
            ...(storeInfo.contact && { phone: { contains: storeInfo.contact, mode: 'insensitive' } }),
          }
        }),
        ...(title && {
          title: { contains: title, mode: 'insensitive' },
        }),
      },
      take: Number(limit),
      skip: Number(offset),
      include: {
        category: true,
        images: true,
        vendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- FIND ONE PRODUCT ---
  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        images: true,
        vendor: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }
    return product;
  }

  // --- CREATE PRODUCT (WITH ROLE BOUNDARY VERIFICATION) ---
  async create(dto: any, userContext: { id: string; role: string }) {
    const { images = [], categoryId, vendorId, ...productData } = dto;

    // 1. Mandatory structural check: A target category ID must be provided
    if (!categoryId) {
      throw new BadRequestException('A valid categoryId is required to create a product.');
    }

    // Verify category presence in the database
    const categoryExists = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      throw new NotFoundException(`Target category with ID "${categoryId}" does not exist.`);
    }

    let assignedVendorId: string;

    // 2. Resolve and secure product ownership rules
    if (userContext.role === 'admin') {
      // Admins cannot own listings directly. They must provide a target vendor ID.
      if (!vendorId) {
        throw new BadRequestException('Administrative listings require an explicit vendorId parameter.');
      }
      assignedVendorId = vendorId;
    } else {
      // User is a Vendor. Lookup their native database vendor profile token.
      const vendorProfile = await this.prisma.vendor.findUnique({
        where: { userId: userContext.id },
      });
      if (!vendorProfile) {
        throw new ForbiddenException('Your account must have an active vendor profile to register items.');
      }
      assignedVendorId = vendorProfile.id;
    }

    // Double check that the resolved vendor record exists
    const vendorExists = await this.prisma.vendor.findUnique({ where: { id: assignedVendorId } });
    if (!vendorExists) {
      throw new NotFoundException(`Target vendor with ID "${assignedVendorId}" does not exist.`);
    }

    // 3. Generate clean, unique URL slugs safely
    const slug = productData.title
      ? productData.title
          .toLowerCase()
          .trim()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-') + `-${Date.now().toString().slice(-4)}`
      : `product-${Date.now()}`;

    try {
      const cleanImages = (Array.isArray(images) ? images : [])
        .map((url: any) => String(url).trim())
        .filter((url: string) => url !== "");

      return await this.prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          slug,
          price: Number(productData.price || 0),
          stock: productData.stock ? Number(productData.stock) : 0,
          // CRITICAL REQUIREMENT: Forced to false upon vendor creation. Admin must approve.
          isActive: userContext.role === 'admin', // If admin creates it on behalf, auto-approve
          category: { connect: { id: categoryId } },
          vendor: { connect: { id: assignedVendorId } },
          images: {
            create: cleanImages.map((url: string) => ({ url })),
          },
        },
        include: {
          category: true,
          images: true,
          vendor: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('A unique property conflict occurred (Check title or slug).');
      }
      throw error;
    }
  }

  // --- UPDATE PRODUCT ---
  async update(id: string, dto: any, userContext: { id: string; role: string }) {
    const { images, categoryId, vendorId, ...productData } = dto;
    
    const existingProduct = await this.findOne(id);

    // Security Gate: Ensure the actor owns this store listing or has administrative clearance
    if (userContext.role !== 'admin') {
      const vendorProfile = await this.prisma.vendor.findUnique({ where: { userId: userContext.id } });
      if (!vendorProfile || existingProduct.vendorId !== vendorProfile.id) {
        throw new ForbiddenException('You are not authorized to update products outside your store.');
      }
    }

    const updateData: any = { ...productData };

    if (productData.title) {
      updateData.slug = productData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') + `-${Date.now().toString().slice(-4)}`;
    }

    if (productData.price !== undefined) updateData.price = Number(productData.price);
    if (productData.stock !== undefined) updateData.stock = Number(productData.stock);
    
    // Safety fallback: Prevent vendors from bypassing approval via update payloads
    if (userContext.role !== 'admin') {
      delete updateData.isActive; 
    } else if (productData.isActive !== undefined) {
      updateData.isActive = productData.isActive === true || productData.isActive === 'true';
    }

    const cleanImages = (Array.isArray(images) ? images : [])
      .map((url: any) => String(url).trim())
      .filter((url: string) => url !== "");

    return this.prisma.$transaction(async (tx) => {
      if (images && Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...updateData,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
          ...(vendorId && userContext.role === 'admin' && { vendor: { connect: { id: vendorId } } }),
          ...(images && Array.isArray(images) && {
            images: {
              create: cleanImages.map((url: string) => ({ url })),
            },
          }),
        },
        include: {
          category: true,
          images: true,
          vendor: true,
        },
      });
    });
  }

  // --- ADMIN INTERFACE: APPROVE PRODUCT TOGGLE ---
  async approveProduct(id: string, approve: boolean) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: approve },
      include: { category: true, images: true, vendor: true },
    });
  }

  // --- REMOVE PRODUCT ---
  async remove(id: string, userContext: { id: string; role: string }) {
    const product = await this.findOne(id);

    if (userContext.role !== 'admin') {
      const vendorProfile = await this.prisma.vendor.findUnique({ where: { userId: userContext.id } });
      if (!vendorProfile || product.vendorId !== vendorProfile.id) {
        throw new ForbiddenException('You can only delete product entities owned by your storefront.');
      }
    }
    
    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }
}