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
  slug?: string | null;
  image?: string;
  parentId?: string | null;
}

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeSlug(rawSlug: unknown, fallbackName?: string): string | undefined {
    if (typeof rawSlug === 'string') {
      const cleaned = this.toSlug(rawSlug);
      if (cleaned) return cleaned;
    }
    if (fallbackName) {
      const generated = this.toSlug(fallbackName);
      return generated || undefined;
    }
    return undefined;
  }

  private normalizeParentId(rawParentId: unknown): string | null | undefined {
    if (rawParentId === undefined) return undefined;
    if (rawParentId === null) return null;
    const trimmed = String(rawParentId).trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private async ensureValidParent(
    parentId: string | null | undefined,
    currentCategoryId?: string,
  ): Promise<void> {
    if (!parentId) return;

    if (currentCategoryId && parentId === currentCategoryId) {
      throw new BadRequestException('A category cannot be its own parent.');
    }

    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
      select: { id: true },
    });

    if (!parent) {
      throw new BadRequestException(`Parent category with ID "${parentId}" does not exist.`);
    }
  }

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
   * Creates a category or subcategory, prioritizing physical multipart uploads over fallback URLs
   */
  async create(data: CategoryInput | undefined, file?: Express.Multer.File) {
    const payload = data ?? {};
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';

    if (!name) {
      throw new BadRequestException('Category name parameter is explicitly required');
    }

    const parentId = this.normalizeParentId(payload.parentId) ?? null;
    await this.ensureValidParent(parentId);

    const slug = this.normalizeSlug(payload.slug, name);
    const resolvedImageUrl = await this.resolveImage(payload.image, file, true);

    try {
      return await this.prisma.category.create({
        data: {
          name,
          slug,
          image: resolvedImageUrl!,
          parentId,
        },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true } },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = Array.isArray(error?.meta?.target)
          ? error.meta.target.join(', ')
          : 'name or slug';
        throw new ConflictException(
          `A category with duplicate ${target} ("${name}") already exists.`,
        );
      }
      throw error;
    }
  }

  /**
   * Updates category fields, slug, parent hierarchy, and image safely
   */
  async update(id: string, data: CategoryInput | undefined, file?: Express.Multer.File) {
    const existing = await this.findOne(id);
    const payload = data ?? {};

    const resolvedImageUrl = await this.resolveImage(payload.image, file, false);
    const normalizedParentId = this.normalizeParentId(payload.parentId);

    if (normalizedParentId !== undefined) {
      await this.ensureValidParent(normalizedParentId, id);
    }

    const updatedPayload: {
      name?: string;
      slug?: string;
      image?: string;
      parentId?: string | null;
    } = {};

    let nextNameForSlug = existing.name;

    if (payload.name !== undefined) {
      const trimmedName = String(payload.name).trim();
      if (!trimmedName) {
        throw new BadRequestException('Category name cannot be empty');
      }
      updatedPayload.name = trimmedName;
      nextNameForSlug = trimmedName;
    }

    if (payload.slug !== undefined || payload.name !== undefined) {
      const nextSlug = this.normalizeSlug(payload.slug, nextNameForSlug);
      if (nextSlug) {
        updatedPayload.slug = nextSlug;
      }
    }

    if (normalizedParentId !== undefined) {
      updatedPayload.parentId = normalizedParentId;
    }

    if (resolvedImageUrl !== undefined) {
      updatedPayload.image = resolvedImageUrl;
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updatedPayload,
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true } },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `A category with duplicate name or slug already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true, image: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true, image: true } },
        _count: { select: { products: true } },
      },
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
          'Cannot safely remove this category because it is still actively tied to existing products or child categories.',
        );
      }
      throw error;
    }
  }
}