// products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { CloudinaryModule } from '../libs/cloudinary/cloudinary.module.js'; // Adjust path as needed
import { PrismaModule } from '../prisma/prisma.module.js'; // Adjust path if necessary

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule, // <-- CRITICAL: This allows ProductsController to resolve CloudinaryService
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}