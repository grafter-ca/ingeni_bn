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
   * Handles single image upload for a new category
   */
  @Post()
  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image')) // 'image' is the key the frontend must use in FormData
  async create(
    @Body() data: any, 
    @UploadedFile() file: Express.Multer.File // This matches the type fix we did earlier
  ) {
    return this.categoryService.create(data, file);
  }

  /**
   * PATCH /categories/:id
   * Allows updating category text or replacing the single image
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