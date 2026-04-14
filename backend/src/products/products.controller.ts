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
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @AllowAnonymous()
  async getAll(
    @Query('category') categoryName?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('title') title?: string,
  ) {
    return this.productsService.findAll({
      categoryName: categoryName || undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      title: title || undefined,
    });
  }

  @Get(':id')
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.findOne(cleanId);
  }

  /**
   * Now handles raw JSON with image URL arrays
   */
  @Post()
  @Roles(['vendor', 'admin'])
  async create(@Body() dto: any) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles(['vendor', 'admin'])
  async update(@Param('id') id: string, @Body() dto: any) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.update(cleanId, dto);
  }

  @Delete(':id')
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.remove(cleanId);
  }
}