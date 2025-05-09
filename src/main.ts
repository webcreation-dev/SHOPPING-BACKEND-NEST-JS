import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { writeFileSync } from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://locapay-manager.vercel.app',
      'http://localhost:5173',
      'http://185.218.125.120:8085',
      'https://locapay-8f958cc17518.herokuapp.com',
      'https://www.locapay.app',
      'http://localhost:8080',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(helmet());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('LOCAPAY BACKEND')
    .setDescription('Documentation for the LOCAPAY API')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .setVersion('1.0')
    .addServer(
      'https://locapay-8f958cc17518.herokuapp.com',
      'Production Server',
    )
    .build();

  const uploadsPath = path.resolve(__dirname, '..', '..', 'upload');

  app.use('/upload', express.static(uploadsPath));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
