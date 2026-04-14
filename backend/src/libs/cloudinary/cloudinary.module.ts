// backend/src/modules/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryProvider } from '../cloudinary/cloudinary.provider.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CloudinaryController } from '../cloudinary/cloudinary.controller.js';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  controllers: [CloudinaryController],
  exports: [CloudinaryService], 
})
export class CloudinaryModule {}