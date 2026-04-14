import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../libs/cloudinary/cloudinary.service.js';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * Handles Single Image Upload for Category Creation
   */
  async create(data: any, file?: Express.Multer.File) {
    let imageUrl = data.imageUrl; // Fallback to a string URL if provided

    // If the admin uploaded a physical file from the computer
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      imageUrl = upload.secure_url; 
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        image: imageUrl || null,
      },
    });
  }

  /**
   * Handles Single Image Update for Category
   */
  async update(id: string, data: any, file?: Express.Multer.File) {
    // 1. Verify the category exists
    await this.findOne(id);

    let imageUrl = data.imageUrl;

    // 2. If a new file is uploaded, it replaces the old one
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      imageUrl = upload.secure_url;
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(imageUrl && { imageUrl }), // Only update imageUrl if we have a new one
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}