import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const apiDocsConfig = new DocumentBuilder()
    .setTitle('OmmaTeam Server: task service API')
    .setDescription('Documentation for the REST API of the task service')
    .setVersion('1.0.0')
    .build();

  const ApiDocsDocument = SwaggerModule.createDocument(app, apiDocsConfig);

  SwaggerModule.setup('api/docs', app, ApiDocsDocument);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 9003);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
