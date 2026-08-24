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
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @AllowAnonymous()
  async getAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @AllowAnonymous()
  async getOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() data: any, 
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.categoryService.create(data, file);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  async remove(@Param('id') id: string) {
    const cleanId = id.replace('local-', '').replace('fake-', '');
    return this.categoryService.remove(cleanId);
  }
}