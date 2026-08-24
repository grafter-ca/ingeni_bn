import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // Makes it easier to use everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 This MUST be here
})
export class PrismaModule {}