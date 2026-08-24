import { Module } from '@nestjs/common';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { PrismaModule } from '../prisma/prisma.module.js'; // Adjust path if necessary

@Module({
  imports: [PrismaModule], // Allows OrderService to use PrismaClient
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService], // Exporting if other modules (like Analytics) need it
})
export class OrderModule {}