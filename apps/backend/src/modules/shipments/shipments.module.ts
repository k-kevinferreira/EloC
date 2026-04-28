import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AdminShipmentsController } from './admin-shipments.controller';
import { ShipmentsService } from './shipments.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
