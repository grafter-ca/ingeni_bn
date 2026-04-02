import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable Nest's built-in body parser
  });

  // In your NestJS main.ts
app.enableCors({
  origin: ['http://localhost:3000','http://localhost:5173'], // Your React App URL
  credentials: true, // Required for Better-Auth cookies
});

await app.listen(8000, '0.0.0.0', () => 
  console.log(`Server running on http://localhost:8000`)
);

}
bootstrap();
