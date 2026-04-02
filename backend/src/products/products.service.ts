import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Updated to handle Workforce filters
   */
  async findAll(params: { 
    categoryName?: string; 
    limit?: number; 
    offset?: number; 
    title?: string 
  } = {}) {
    const { categoryName, limit = 20, offset = 0, title } = params;

    return this.prisma.product.findMany({
      where: {
        // Filter by category if categoryName is provided
        ...(categoryName && { categoryName }),
        // Case-insensitive search for title if provided
        ...(title && {
          title: {
            contains: title,
            mode: 'insensitive',
          },
        }),
      },
      // Pagination
      take: limit,
      skip: offset,
      include: {
        category: true,
      },
      orderBy: {
        id: 'desc', // Shows newest products first
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true }, // Ensure category info is returned for details page
    });
  }

  async findByCategory(categoryName: string) {
    return this.prisma.product.findMany({
      where: {
        category: {
          name: {
            contains: categoryName,
            mode: 'insensitive',
          },
        },
      },
      include: { category: true },
    });
  }

  async create(data: any) {
    return this.prisma.product.create({ 
      data,
      include: { category: true } 
    });
  }

  async update(id: number, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}