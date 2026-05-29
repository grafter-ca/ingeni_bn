import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  // Use the injected instance explicitly to ensure configuration rules apply
  constructor(@Inject('CLOUDINARY') private cloudinaryInstance: any) {}

  /**
   * Handles a single file buffer upload with optimization pipelines
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new BadRequestException('No file stream binary provided'));
      }

      // Enforce file type guards explicitly at the execution boundary
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return reject(new BadRequestException(`Unsupported file format: ${file.mimetype}`));
      }

      // Open stream pipeline with modern asset transformations applied natively on ingest
      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        {
          folder: 'ingeri-store',
          resource_type: 'image', // Explicitly restrict to image assets
          allowed_formats: ['jpg', 'png', 'webp', 'avif'],
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Prevent oversized uploads (4K/8K scales)
            { fetch_format: 'auto' }, // Automatically serves WebP/AVIF depending on browser support
            { quality: 'auto:good' }  // Intelligent visual compression
          ]
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary response data package dropped'));
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Handles multiple files sequentially or concurrently
   */
  async uploadMultipleFiles(files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Generates type-safe signature payload for client-side frontend uploads
   */
  getUploadSignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'ingeri-store';

    // Access config parameters natively via the verified module instance
    const apiSecret = this.cloudinaryInstance.config().api_secret;
    const cloudName = this.cloudinaryInstance.config().cloud_name;
    const apiKey = this.cloudinaryInstance.config().api_key;

    if (!apiSecret) {
      throw new Error('Cloudinary configuration error: API Secret key missing');
    }

    const signature = this.cloudinaryInstance.utils.api_sign_request(
      { timestamp, folder },
      apiSecret,
    );

    return {
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    };
  }
}