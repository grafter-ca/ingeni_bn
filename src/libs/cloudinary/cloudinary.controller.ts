import { 
  Controller, 
  Post, 
  Get, 
  UseInterceptors, 
  UploadedFile, 
  UploadedFiles,
  BadRequestException,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service.js';
import { AuthGuard } from '../../auth/guards/auth.guard.js';

@Controller('cloudinary')
@UseGuards(AuthGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('signature')
  getSignature() {
    return this.cloudinaryService.getUploadSignature();
  }

  @Post('upload-single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Rigid 5MB hard ceiling limit
        ],
        fileIsRequired: true
      })
    ) file: Express.Multer.File
  ) {
    return await this.cloudinaryService.uploadFile(file);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No payload file matrices submitted');
    }
    
    // Explicitly validate file-size limits on arrays before dispatching promise handlers
    for (const file of files) {
      if (file.size > 1024 * 1024 * 5) {
        throw new BadRequestException(`File ${file.originalname} exceeds the maximum allowed limit of 5MB`);
      }
    }

    return await this.cloudinaryService.uploadMultipleFiles(files);
  }
}