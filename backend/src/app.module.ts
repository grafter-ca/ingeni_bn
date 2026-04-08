import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { getAuthConfiguration } from './auth.js';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module.js';
import { UserModule } from './user/user.module.js';
import { CategoryModule } from './category/category.module.js';
import { OrderService } from './order/order.service.js';
import { OrderModule } from './order/order.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../dist'), // frontend build folder
      exclude: ['/api*'], // do not override API routes
    }),
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
    UserModule,
    CategoryModule,
    OrderModule,
  ],
  controllers: [],
  providers: [OrderService],
})
export class AppModule {}