import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SubscribersController } from './subscribers.controller.js';
import { SubscribersService } from './subscribers.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [SubscribersController],
  providers: [SubscribersService],
  exports: [SubscribersService],
})
export class SubscribersModule {}