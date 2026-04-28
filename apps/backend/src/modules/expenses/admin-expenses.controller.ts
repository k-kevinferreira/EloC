import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { IdParamDto } from 'src/common/dto/id-param.dto';

import { ADMIN_ROLES } from '../auth/constants/admin-roles.constant';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('admin/expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  findAll(@Query() query: ListExpensesQueryDto) {
    return this.expensesService.findAll(query);
  }

  @Post()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  update(@Param() params: IdParamDto, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(params.id, updateExpenseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(ADMIN_ROLES.superAdmin)
  async remove(@Param() params: IdParamDto) {
    await this.expensesService.remove(params.id);
  }
}
