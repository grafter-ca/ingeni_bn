// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service.js';
import { CloudinaryService } from '../libs/cloudinary/cloudinary.service.js';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Get('public')
  @AllowAnonymous()
  async getAllPublic(@Query() query: any) {
    return this.productsService.findAll(query, true);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(['vendor', 'admin'])
  async getAllPrivate(@Query() query: any, @Req() req: any) {
    const currentUser = req.user || req.session?.user || req.auth;
    const userContext = { id: currentUser?.id || currentUser?.sub, role: currentUser?.role };
    return this.productsService.findAll(query, false, userContext);
  }

  @Get('search')
  @AllowAnonymous()
  async searchProducts(@Query('q') q: string) {
    return this.productsService.searchProducts(q);
  }

  // --- REVIEWS: GET REVIEWS FOR A PRODUCT ---
  @Get(':id/reviews')
  @AllowAnonymous()
  async getProductReviews(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.getProductReviews(cleanId);
  }

  // --- REVIEWS: POST A NEW REVIEW (Allowed for Anonymous) ---
  @Post(':id/reviews')
  @AllowAnonymous()
  async addProductReview(
    @Param('id') id: string,
    @Body() dto: { rating: number; comment: string; authorName?: string },
    @Req() req: any,
  ) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    const currentUser = req.user || req.session?.user || req.auth;
    const userId = currentUser?.id || currentUser?.sub;
    return this.productsService.addProductReview(cleanId, dto, userId);
  }

  // --- WISHLIST: CHECK STATUS (Allowed for Anonymous) ---
  @Get(':id/wishlist/status')
  @AllowAnonymous()
  async checkWishlistStatus(@Param('id') id: string, @Req() req: any) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    const currentUser = req.user || req.session?.user || req.auth;
    const userId = currentUser?.id || currentUser?.sub;
    return this.productsService.checkWishlistStatus(cleanId, userId);
  }

  // --- WISHLIST: TOGGLE STATUS (ADD/REMOVE) ---
  @Post(':id/wishlist/toggle')
  @AllowAnonymous()
  async toggleWishlist(@Param('id') id: string, @Req() req: any) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    const currentUser = req.user || req.session?.user || req.auth;
    const userId = currentUser?.id || currentUser?.sub;
    return this.productsService.toggleWishlist(cleanId, userId);
  }

  @Get(':id')
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.findOne(cleanId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(['vendor', 'admin'])
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: any,
    @Req() req: any,
  ) {
    try {
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
        imageUrls = uploadResults.map((res) => res.secure_url);
      }
      else if (dto.images) {
        imageUrls = Array.isArray(dto.images) ? dto.images : [dto.images];
      }

      const sanitizedDto = {
        ...dto,
        price: dto.price ? parseFloat(dto.price) : 0,
        stock: dto.stock ? parseInt(dto.stock) : 0,
        images: imageUrls
      };

      const currentUser = req.user || req.session?.user || req.auth;
      const userContext = { id: currentUser?.id || currentUser?.sub, role: currentUser?.role };

      return await this.productsService.create({ ...sanitizedDto, images: imageUrls }, userContext);
    } catch (error: any) {
      console.error("ERROR IN CREATE PRODUCT:", error?.message || error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(['vendor', 'admin'])
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: any,
    @Req() req: any,
  ) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    let imageUrls: string[] | undefined = undefined;

    if (files && files.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
      imageUrls = uploadResults.map((res) => res.secure_url);
    }

    const existingImages = dto.images_to_keep
      ? Array.isArray(dto.images_to_keep)
        ? dto.images_to_keep
        : [dto.images_to_keep]
      : [];

    const finalImages = imageUrls ? [...existingImages, ...imageUrls] : existingImages.length > 0 ? existingImages : undefined;
    const sanitizedDto = { ...dto, price: dto.price ? parseFloat(dto.price) : 0, stock: dto.stock ? parseInt(dto.stock) : 0 };

    const currentUser = req.user || req.session?.user || req.auth;
    const userContext = { id: currentUser?.id || currentUser?.sub, role: currentUser?.role };

    return this.productsService.update(cleanId, { ...sanitizedDto, ...(finalImages && { images: finalImages }) }, userContext);
  }

  @Patch(':id/approve')
  @Roles(['admin'])
  async approve(@Param('id') id: string, @Body('approve') approve: boolean) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.approveProduct(cleanId, approve);
  }

  @Delete(':id')
  @Roles(['vendor', 'admin'])
  async remove(@Param('id') id: string, @Req() req: any) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    const currentUser = req.user || req.session?.user || req.auth;
    const userContext = { id: currentUser?.id || currentUser?.sub, role: currentUser?.role };
    return this.productsService.remove(cleanId, userContext);
  }
}