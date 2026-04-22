import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AdminSubcategoriesController } from './admin-subcategories.controller';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesService } from './subcategories.service';

@Module({
  imports: [AuthModule],
  controllers: [SubcategoriesController, AdminSubcategoriesController],
  providers: [SubcategoriesService],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule {}
