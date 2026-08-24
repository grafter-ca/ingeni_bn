// backend/src/order/dto/create-order.dto.ts
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';
import { PaymentMethod } from '../../../generated/prisma/client.js';

class OrderItemDto {
  @IsString()
  productId!: string;

  @IsString()
  vendorId!: string;

  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value)) // Transforms string form fields into numbers
  quantity!: number;
}

class GuestUserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  phoneNumber!: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @Transform(({ value }) => {
    // If sent as a JSON string from FormData, parse it into an array
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  items!: OrderItemDto[];

  @IsString()
  shippingAddress!: string;

  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  paymentProofUrl?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // -----------------------------------
  // OPTIONAL TOTALS (With string-to-number transformers)
  // -----------------------------------

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  shippingFees?: number;

  // -----------------------------------
  // OPTIONAL USER
  // -----------------------------------

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestUserDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  user?: GuestUserDto;

  @IsOptional()
  @IsString()
  userId?: string;

  // Optional property for the raw multer file stream
  @IsOptional()
  paymentProofFile?: any;
}