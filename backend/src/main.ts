import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Production Proxy Configuration
  if (process.env.NODE_ENV?.toLowerCase() === 'production') {
    app.set('trust proxy', 1);
    console.log('✅ Trust proxy enabled for Production');
  }

  app.enableCors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL || 'http://localhost:3000','http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'X-Requested-With', 
      'Cookie', 
      'Set-Cookie',
      'x-better-auth-csrf', // If using Better-Auth
    ],
  });

   app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

   const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
  });

  app.use(limiter); 

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const PORT = process.env.PORT || 8000;
  await app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
bootstrap();