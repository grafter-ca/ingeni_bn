import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { string } from 'better-auth';

@Controller('categories') // Changed to plural to match frontend calls
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Used for the Sidebar and CategoryShowcase
  @Get()
  @AllowAnonymous()
  async getAll() {
    return this.categoryService.findAll();
  }

  // Used when clicking a specific category to see its details/products
  @Get(':id')
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    // If your frontend sends "local-1", we strip the prefix
    const cleanId = id.replace('local-', '');
    return this.categoryService.findOne(cleanId);
  }
}