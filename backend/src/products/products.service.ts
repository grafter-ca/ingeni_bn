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
    const filters: any = {}; 
    
    if (isPublic) {
      filters.isActive = true;
    } 
    else if (!isPublic && userContext?.role === 'vendor') {
      const vendorProfile = await this.prisma.vendor.findUnique({
        where: { userId: userContext.id },
        select: { id: true },
      });
      if (!vendorProfile) throw new ForbiddenException('Vendor profile not found.');
      filters.vendorId = vendorProfile.id; 
    } 
    else if (vendorId) {
      filters.vendorId = vendorId; 
    }
    
    return filters;
  }

  // --- FIND ALL PRODUCTS ---
  async findAll(
    params: {
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
      includeInactive?: boolean;
    } = {},
    isPublic: boolean = false,
    userContext?: { id: string; role: string }
  ) {
    const { categoryName, vendorId, limit = 20, offset = 0, title, storeInfo, includeInactive = false } = params;
    
    const accessFilters = await this.getAccessFilters(isPublic, userContext, vendorId);
    
    let resolvedVendorId = vendorId;

    if (!isPublic && userContext && userContext.role === 'vendor') {
      const vendorProfile = await this.prisma.vendor.findUnique({
        where: { userId: userContext.id },
        select: { id: true },
      });

      if (!vendorProfile) {
        throw new ForbiddenException('Vendor Profile not found for this account.');
      }
      resolvedVendorId = vendorProfile.id;
    }

    return this.prisma.product.findMany({
      where: {
        ...accessFilters,
        ...(!includeInactive && isPublic && { isActive: true }),
        ...(categoryName && {
          category: {
            name: { contains: categoryName, mode: 'insensitive' },
          },
        }),
        ...(resolvedVendorId && { vendorId: resolvedVendorId }),
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
        reviews: true, // <-- Added reviews here so ProductCard calculates ratings correctly
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
        reviews: true, // <-- Added reviews here as well
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }
    return product;
  }

  // --- CREATE PRODUCT ---
  async create(dto: any, userContext: { id: string; role: string }) {
    const { images = [], categoryId, vendorId, ...productData } = dto;

    if (!categoryId) {
      throw new BadRequestException('A valid categoryId is required to create a product.');
    }

    const categoryExists = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      throw new NotFoundException(`Target category with ID "${categoryId}" does not exist.`);
    }

    let assignedVendorId: string;

    if (userContext.role === 'admin') {
      if (!vendorId) {
        throw new BadRequestException('Administrative listings require an explicit vendorId parameter.');
      }

      let vendorProfile = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendorProfile) {
        vendorProfile = await this.prisma.vendor.findUnique({ where: { userId: vendorId } });
      }

      if (!vendorProfile) {
        const userExists = await this.prisma.user.findUnique({ where: { id: vendorId } });
        if (!userExists) {
          throw new NotFoundException(`Target account or vendor with ID "${vendorId}" does not exist.`);
        }

        vendorProfile = await this.prisma.vendor.create({
          data: {
            userId: vendorId,
            storeName: 'Ingeri Admin Store',
          },
        });
      }

      assignedVendorId = vendorProfile.id;
    } else {
      const vendorProfile = await this.prisma.vendor.findUnique({
        where: { userId: userContext.id },
      });
      if (!vendorProfile) {
        throw new ForbiddenException('Your account must have an active vendor profile to register items.');
      }
      assignedVendorId = vendorProfile.id;
    }

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

      const initialIsActive = productData.isActive !== undefined 
        ? Boolean(productData.isActive) 
        : true;

      return await this.prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          slug,
          price: Number(productData.price || 0),
          stock: productData.stock ? Number(productData.stock) : 0,
          location: productData.location || null,
          isActive: initialIsActive,
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
          reviews: true,
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
    const { images, categoryId, vendorId, images_to_keep, ...productData } = dto;
    
    const existingProduct = await this.findOne(id);

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

    if (userContext.role !== 'admin') {
      delete updateData.isActive;
    } else if (productData.isActive !== undefined) {
      updateData.isActive = productData.isActive === true || productData.isActive === 'true';
    }

    let resolvedUpdateVendorId: string | undefined = undefined;
    if (vendorId && userContext.role === 'admin') {
      let vendorProfile = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendorProfile) {
        vendorProfile = await this.prisma.vendor.findUnique({ where: { userId: vendorId } });
      }
      if (!vendorProfile) {
        throw new NotFoundException(`Target vendor or account with ID "${vendorId}" does not exist.`);
      }
      resolvedUpdateVendorId = vendorProfile.id;
    }

    const cleanImages = (Array.isArray(images) ? images : [])
      .map((url: any) => String(url).trim())
      .filter((url: string) => url !== "");

    const existingImagesToKeep = images_to_keep
      ? (Array.isArray(images_to_keep) ? images_to_keep : [images_to_keep])
      : [];

    return this.prisma.$transaction(async (tx) => {
      if (images && Array.isArray(images)) {
        await tx.productImage.deleteMany({ 
          where: { 
            productId: id,
            url: { notIn: existingImagesToKeep },
          },
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...updateData,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
          ...(resolvedUpdateVendorId && { vendor: { connect: { id: resolvedUpdateVendorId } } }),
          ...(images && Array.isArray(images) && cleanImages.length > 0 && {
            images: {
              create: cleanImages.map((url: string) => ({ url })),
            },
          }),
        },
        include: {
          category: true,
          images: true,
          vendor: true,
          reviews: true,
        },
      });
    });
  }

  // --- APPROVE PRODUCT ---
  async approveProduct(id: string, approve: boolean) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: approve },
      include: { category: true, images: true, vendor: true, reviews: true },
    });
  }

  // --- SEARCH PRODUCTS ---
  async searchProducts(query: string) {
    if (!query || query.trim() === '') return [];
    
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
      take: 6,
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

  // --- REVIEWS METHODS ---
  async getProductReviews(productId: string) {
    return this.prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    });
  }

  async addProductReview(
    productId: string, 
    dto: { rating: number; comment: string; authorName?: string }, 
    userId?: string | null
  ) {
    return this.prisma.productReview.create({
      data: {
        productId,
        userId: userId ? userId : undefined,
        authorName: !userId ? (dto.authorName?.trim() || 'Anonymous') : undefined,
        rating: Number(dto.rating),
        comment: dto.comment,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async checkWishlistStatus(productId: string, userId?: string, guestId?: string): Promise<boolean> {
    if (userId) {
      const record = await this.prisma.wishlist.findFirst({
        where: { userId, productId },
      });
      return !!record;
    }
    
    return false; 
  }

  async toggleWishlist(productId: string, userId?: string, guestId?: string): Promise<{ status: boolean; message: string }> {
    if (!userId) {
      throw new BadRequestException('Please log in to sync your wishlist across devices.');
    }

    const existing = await this.prisma.wishlist.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { status: false, message: 'Removed from wishlist' };
    } else {
      await this.prisma.wishlist.create({
        data: { userId, productId },
      });
      return { status: true, message: 'Added to wishlist' };
    }
  }
}