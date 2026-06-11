import { Module } from '@nestjs/common';

import { GeminiModule } from '../ai/gemini.module';
import { ProductsModule } from '../products/products.module';
import { UploadsModule } from '../uploads/uploads.module';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [GeminiModule, ProductsModule, UploadsModule],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
