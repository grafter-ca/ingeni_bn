import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { getAuthConfiguration } from './auth.js';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module.js';
import { AuthModule  as Athenticator } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { CategoryModule } from './category/category.module.js';

@Module({
  imports: [
    PrismaModule, // Your existing Prisma Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => {
        // We pass the ALREADY CONNECTED prisma instance here
        const auth = getAuthConfiguration(prisma);
        return { auth };
      },
    }),
    ProductsModule,
    Athenticator,
    UserModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}