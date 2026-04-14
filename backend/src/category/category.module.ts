import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { CloudinaryModule } from '../libs/cloudinary/cloudinary.module.js';

@Module({
  imports: [CloudinaryModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}