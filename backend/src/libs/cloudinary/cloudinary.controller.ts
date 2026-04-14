import { 
  Controller, 
  Post, 
  Get, 
  UseInterceptors, 
  UploadedFile, 
  UploadedFiles,
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js'; // Recommended: Protect these routes

@Controller('cloudinary')
@UseGuards(AuthGuard) // Only logged-in users (Vendors/Admins) should upload
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * GET /cloudinary/signature
   * Used by Vite frontend to get permission for direct Cloudinary uploads.
   */
  @Get('signature')
  getSignature() {
    return this.cloudinaryService.getUploadSignature();
  }

  /**
   * POST /cloudinary/upload-single
   * Handles a single file upload through the NestJS server.
   */
  @Post('upload-single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return await this.cloudinaryService.uploadFile(file);
  }

  /**
   * POST /cloudinary/upload-multiple
   * Handles multiple files (e.g., product galleries) through the NestJS server.
   */
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 5)) // Limit to 5 images per product
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    return await this.cloudinaryService.uploadMultipleFiles(files);
  }
}