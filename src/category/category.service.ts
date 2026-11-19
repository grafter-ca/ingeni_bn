import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../libs/cloudinary/cloudinary.service.js';

interface CategoryInput {
  name?: string;
  image?: string;
}

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private isValidImageReference(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('/')) return true;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }

  private async resolveImage(
    rawImage: unknown,
    file?: Express.Multer.File,
    required = false,
  ): Promise<string | undefined> {
    if (file) {
      const upload = await this.cloudinary.uploadFile(file);
      return upload.secure_url;
    }

    if (typeof rawImage === 'string') {
      const trimmed = rawImage.trim();
      if (!trimmed) {
        if (required) {
          throw new BadRequestException(
            'A valid category representation image file or URL must be submitted',
          );
        }
        return undefined;
      }

      if (!this.isValidImageReference(trimmed)) {
        throw new BadRequestException('Category image must be a valid HTTP(S) URL or path');
      }

      return trimmed;
    }

    if (required) {
      throw new BadRequestException(
        'A valid category representation image file or URL must be submitted',
      );
    }

    return undefined;
  }

  /**
   * Creates a brand category, prioritizing physical multipart uploads over fallback URLs
   */
  async create(data: CategoryInput | undefined, file?: Express.Multer.File) {
    const payload = data ?? {};
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';

    if (!name) {
      throw new BadRequestException('Category name parameter is explicitly required');
    }

    const resolvedImageUrl = await this.resolveImage(payload.image, file, true);

    try {
      return await this.prisma.category.create({
        data: {
          name,
          image: resolvedImageUrl!,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`A category named "${name}" already exists.`);
      }
      throw error;
    }
  }

  /**
   * Updates text properties and purges unreferenced schema properties safely
   */
  async update(id: string, data: CategoryInput | undefined, file?: Express.Multer.File) {
    await this.findOne(id);
    const payload = data ?? {};

    const resolvedImageUrl = await this.resolveImage(payload.image, file, false);

    const updatedPayload: { name?: string; image?: string } = {};

    if (payload.name !== undefined) {
      const trimmedName = String(payload.name).trim();
      if (!trimmedName) {
        throw new BadRequestException('Category name cannot be empty');
      }
      updatedPayload.name = trimmedName;
    }

    if (resolvedImageUrl !== undefined) {
      updatedPayload.image = resolvedImageUrl;
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updatedPayload,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `A category named "${updatedPayload.name}" already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
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
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'Cannot safely remove this category because it is still actively tied to existing products.',
        );
      }
      throw error;
    }
  }
}