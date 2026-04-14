import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    categoryName?: string;
    vendorId?: string;
    limit?: number;
    offset?: number;
    title?: string;
  } = {}) {
    const { categoryName, vendorId, limit = 20, offset = 0, title } = params;

    return this.prisma.product.findMany({
      where: {
        ...(categoryName && {
          category: {
            name: { contains: categoryName, mode: 'insensitive' },
          },
        }),
        ...(vendorId && { vendorId }),
        ...(title && {
          title: { contains: title, mode: 'insensitive' },
        }),
      },
      take: limit,
      skip: offset,
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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

  async create(dto: any) {
    const { images = [], categoryId, vendorId, ...productData } = dto;

    const slug = productData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    try {
      return await this.prisma.product.create({
        data: {
          ...productData,
          slug,
          price: Number(productData.price),
          stock: productData.stock ? Number(productData.stock) : 0,
          isActive: productData.isActive === true || productData.isActive === 'true',
          category: { connect: { id: categoryId } },
          vendor: { connect: { id: vendorId } },
          images: {
            create: images.map((url: string) => ({ url })),
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
        throw new BadRequestException('A product with this title already exists.');
      }
      throw error;
    }
  }

  async update(id: string, dto: any) {
    const { images, categoryId, vendorId, ...productData } = dto;
    await this.findOne(id);

    const updateData: any = { ...productData };

    if (productData.title) {
      updateData.slug = productData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    }

    if (productData.price) updateData.price = Number(productData.price);
    if (productData.stock) updateData.stock = Number(productData.stock);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(vendorId && { vendor: { connect: { id: vendorId } } }),
        ...(images && Array.isArray(images) && {
          images: {
            deleteMany: {}, // Clear old gallery
            create: images.map((url: string) => ({ url })), // Set new gallery
          },
        }),
      },
      include: {
        category: true,
        images: true,
        vendor: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}