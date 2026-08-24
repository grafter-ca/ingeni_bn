// src/vendors/vendors.module.ts
import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller.js';
import { VendorsService } from './vendors.service.js';
import { EmailModule } from '../libs/nodemail/emai.module.js';

@Module({
    imports: [EmailModule], 
  controllers: [VendorsController],
  providers: [VendorsService],
})
export class VendorsModule {}