import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AdminEntriesController } from './admin-entries.controller';
import { EntriesService } from './entries.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminEntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
