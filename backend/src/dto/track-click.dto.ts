// src/analytics/dto/track-click.dto.ts
import { IsString, IsOptional, IsIn } from 'class-validator';

export class TrackClickDto {
  @IsString()
  @IsIn(['whatsapp', 'call'], { message: 'actionType must be either whatsapp or call' })
  actionType!: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;
}