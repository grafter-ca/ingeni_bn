import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service.js';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('categories')
@UseGuards(RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @AllowAnonymous()
  async getAll() {
    return this.categoryService.findAll();
  }

  /**
   * POST /categories
   * Processes a single image binary stream from FormData to create a category
   */
  @Post()
  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image')) // Front-end must append file binary directly to the 'image' key
  async create(
    @Body() data: any, 
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.categoryService.create(data, file);
  }

  /**
   * PATCH /categories/:id
   * Mutates textual fields or handles asset substitution seamlessly
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string, 
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.categoryService.update(cleanId, data, file);
  }

  @Delete(':id')
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.categoryService.remove(cleanId);
  }
}