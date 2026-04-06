import { IsString, IsArray, IsEnum, IsNotEmpty, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../generated/prisma/client.js';

// This handles individual items in the cart
class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

// This handles the main Order request
export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}