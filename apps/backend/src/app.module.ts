import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app/app.config';
import { authConfig } from './config/auth/auth.config';
import { databaseConfig } from './config/database/database.config';
import { validateEnv } from './config/env/env.validation';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { SubcategoriesModule } from './modules/subcategories/subcategories.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: '.env',
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    AdminsModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
