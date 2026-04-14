import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  // We inject 'CLOUDINARY' which is the 'provide' name from your provider file
  constructor(@Inject('CLOUDINARY') private cloudinaryInstance: any) {}

  /**
   * Handles a single file buffer upload
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new BadRequestException('No file provided'));
      }

      console.log('Cloudinary Config:', process.env.CLOUDINARY_API_KEY ? 'Key Found' : 'Key MISSING');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ingeri-store',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload result is undefined'));
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Handles multiple files (Useful for Product Galleries)
   */
  async uploadMultipleFiles(files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Generates signature for the Vite frontend
   */
  getUploadSignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'ingeri-store';

    // Access config through the injected instance
    const apiSecret = cloudinary.config().api_secret;

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret!,
    );

    return {
      signature,
      timestamp,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder,
    };
  }
}