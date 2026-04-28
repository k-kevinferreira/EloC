import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app/app.config';
import { authConfig } from './config/auth/auth.config';
import { databaseConfig } from './config/database/database.config';
import { validateEnv } from './config/env/env.validation';
import { uploadsConfig } from './config/uploads/uploads.config';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EntriesModule } from './modules/entries/entries.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ProductsModule } from './modules/products/products.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { SubcategoriesModule } from './modules/subcategories/subcategories.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: '.env',
      load: [appConfig, authConfig, databaseConfig, uploadsConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    AdminsModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
    ProductsModule,
    EntriesModule,
    ExpensesModule,
    ShipmentsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
