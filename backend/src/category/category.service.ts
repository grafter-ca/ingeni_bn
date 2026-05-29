import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../libs/cloudinary/cloudinary.service.js';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * Creates a brand category, prioritizing physical multipart uploads over fallback URLs
   */
  async create(data: any, file?: Express.Multer.File) {
    if (!data.name || String(data.name).trim() === '') {
      throw new BadRequestException('Category name parameter is explicitly required');
    }

    let resolvedImageUrl = data.image || ''; // Fallback string if directly provided

    // If a raw image stream is transmitted from the user's browser, pipe directly to Cloudinary
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      resolvedImageUrl = upload.secure_url; 
    }

    if (!resolvedImageUrl) {
      throw new BadRequestException('A valid category representation image file or URL must be submitted');
    }

    return this.prisma.category.create({
      data: {
        name: String(data.name).trim(),
        image: resolvedImageUrl, // Correctly synchronized field mapped to schema rule
      },
    });
  }

  /**
   * Updates text properties and purges unreferenced schema properties safely
   */
  async update(id: string, data: any, file?: Express.Multer.File) {
    // 1. Verify that the matching database category record target exists
    await this.findOne(id);

    let resolvedImageUrl = data.image;

    // 2. Overwrite the image configuration property if a clean replacement file is part of the request stream
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      resolvedImageUrl = upload.secure_url;
    }

    // 3. Construct clean properties payload, shielding the database engine from dirty fields
    const updatedPayload: any = {};
    if (data.name !== undefined) {
      updatedPayload.name = String(data.name).trim();
    }
    if (resolvedImageUrl !== undefined) {
      updatedPayload.image = resolvedImageUrl; // Correctly maps destination string variables safely
    }

    return this.prisma.category.update({
      where: { id },
      data: updatedPayload,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        // Appends a fast relational counter tracking associated product quantities
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category record reference lookup for ID "${id}" failed`);
    }
    return category;
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error: any) {
      // Catches instances where active products depend directly on this category mapping node
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Cannot safely remove this category because it is still actively tied to existing products.',
        );
      }
      throw error;
    }
  }
}