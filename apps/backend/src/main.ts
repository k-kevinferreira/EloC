import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const globalPrefix = configService.get<string>('app.globalPrefix', 'api');
  const port = configService.get<number>('app.port', 3001);
  const uploadsStorageProvider = configService.get<string>(
    'uploads.storageProvider',
    'local',
  );

  if (uploadsStorageProvider === 'local') {
    const uploadsRoot = resolve(
      process.cwd(),
      configService.get<string>('uploads.localRoot', 'uploads'),
    );

    mkdirSync(uploadsRoot, { recursive: true });
    app.use('/uploads', express.static(uploadsRoot));
  }

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);
}

void bootstrap();
