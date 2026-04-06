import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express'
import {NestExpressApplication} from '@nestjs/platform-express'


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // Disable Nest's built-in body parser
  });


 if (process.env.NODE_ENV?.toLowerCase() === 'production') {
    app.set('trust proxy', 1); // 1 = trust first proxy (Standard for most hosts)
    console.log('✅ Trust proxy enabled for Production');
  }

  // In your NestJS main.ts
app.enableCors({
  origin: ['http://localhost:3000','http://localhost:5173'], // Your React App URL
  credentials: true, // Required for Better-Auth cookies
});

// use global validation pipe line
app.useGlobalPipes(new ValidationPipe())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000
await app.listen(PORT, '0.0.0.0', () => 
  console.log(`Server running on http://localhost:${PORT}`)
);

}
bootstrap();
