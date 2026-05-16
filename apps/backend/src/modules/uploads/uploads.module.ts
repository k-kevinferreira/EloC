import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import { AdminUploadsController } from './admin-uploads.controller';
import { LocalProductImageStorage } from './storage/local-product-image.storage';
import { PRODUCT_IMAGE_STORAGE } from './storage/product-image-storage.interface';
import { SupabaseProductImageStorage } from './storage/supabase-product-image.storage';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get<number>(
            'uploads.maxProductImageSizeInBytes',
            5 * 1024 * 1024,
          ),
          files: 1,
        },
      }),
    }),
  ],
  controllers: [AdminUploadsController],
  providers: [
    {
      provide: PRODUCT_IMAGE_STORAGE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const storageProvider = configService.get<string>(
          'uploads.storageProvider',
          'local',
        );

        if (storageProvider === 'supabase') {
          return new SupabaseProductImageStorage(configService);
        }

        return new LocalProductImageStorage(configService);
      },
    },
    UploadsService,
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
