import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AdminExpensesController } from './admin-expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
