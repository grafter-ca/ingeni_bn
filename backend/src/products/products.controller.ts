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
  ) {}

  @Get()
  @AllowAnonymous()
 async getAllPublic(@Query() query: any) {
    return this.productsService.findAll(query, true);
  }

  @Get(':id')
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.findOne(cleanId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(['vendor', 'admin'])
  async getAllPrivate(@Query() query: any, @Req() req: any) {
    // Force ownership context
    const userContext = { id: req.user.id, role: req.user.role };
    return this.productsService.findAll(query, false, userContext);
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
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files);
      imageUrls = uploadResults.map((res) => res.secure_url);
    }

    // Access payload context injected by your Better-Auth validation passport layer
    const userContext = { id: req.user.id, role: req.user.role };
    return this.productsService.create({ ...dto, images: imageUrls }, userContext);
  }

  @Patch(':id')
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
    } else if (dto.images) {
      imageUrls = Array.isArray(dto.images) ? dto.images : [dto.images];
    }

    const userContext = { id: req.user.id, role: req.user.role };
    return this.productsService.update(cleanId, { ...dto, ...(imageUrls && { images: imageUrls }) }, userContext);
  }

  // --- ADMIN REVIEWS: APPROVAL ENDPOINT ---
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
    const userContext = { id: req.user.id, role: req.user.role };
    return this.productsService.remove(cleanId, userContext);
  }
}