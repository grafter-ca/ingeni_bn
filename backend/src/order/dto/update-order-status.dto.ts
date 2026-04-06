import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/client.js'; // Import your Enum

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}