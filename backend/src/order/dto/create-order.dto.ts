import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { PaymentMethod } from '../../../generated/prisma/client.js';

class OrderItemDto {
  @IsString()
  productId!: string;

  @IsString()
  vendorId!: string;

  @IsNumber()
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
  items!: OrderItemDto[];

  @IsString()
  shippingAddress!: string;

  @IsString()
  phoneNumber!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // -----------------------------------
  // OPTIONAL TOTALS
  // -----------------------------------

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  shippingFees?: number;

  // -----------------------------------
  // OPTIONAL USER
  // -----------------------------------

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestUserDto)
  user?: GuestUserDto;

  @IsOptional()
  @IsString()
  userId?: string;
}