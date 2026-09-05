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
import { CloudinaryModule } from './libs/cloudinary/cloudinary.module.js';
import { VendorsModule } from './vendors/vendors.module.js';
import { SocketModule } from './socket/socket.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { HealthService } from './health/health.service.js';
import { HealthController } from './health/health.controller.js';
import { HealthModule } from './health/health.module.js';
import { EventsModule } from './events/events.module.js';

@Module({
  imports: [
    PrismaModule,
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
    SocketModule,
    VendorsModule,
    UserModule,
    CategoryModule,
    OrderModule,
    CloudinaryModule,
    AnalyticsModule,
    HealthModule,
    EventsModule
  ],
  controllers: [HealthController],
  providers: [OrderService, HealthService],
})
export class AppModule {}