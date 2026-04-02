import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /api/products
   * Supports: ?categoryId=X&limit=Y&offset=Z&title=abc
   */
  @Get()
  @AllowAnonymous()
  async getAll(
    @Query('category') categoryName?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('title') title?: string,
  ) {
    if (!categoryName){
      return this.productsService.findAll({
    limit: limit ? Number(limit) : 20, offset: offset ? Number(offset) : 0, title: title || undefined
  });   
    }
    // We parse strings to numbers here before passing to the service
    return this.productsService.findAll({
      categoryName: categoryName || undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      title: title || undefined,
    });
  }

  /**
   * GET /api/products/:id
   * Handles prefixed IDs like "local-1" or "fake-1"
   */
  @Get(':id')
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    // Strip prefixes if they exist so the service gets a clean Database ID
    const cleanId = id.replace('local-', '').replace('fake-', '');
    
    // Convert to number for your DB lookup
    return this.productsService.findOne(Number(cleanId));
  }

  @Post()
  async create(@Body() createProductDto: any) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateProductDto: any
  ) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.update(Number(cleanId), updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.productsService.remove(Number(cleanId));
  }
}