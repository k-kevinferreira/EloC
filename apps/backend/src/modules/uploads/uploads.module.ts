import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import { AdminUploadsController } from './admin-uploads.controller';
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
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
