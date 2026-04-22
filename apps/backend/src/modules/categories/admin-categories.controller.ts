import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { IdParamDto } from 'src/common/dto/id-param.dto';

import { ADMIN_ROLES } from '../auth/constants/admin-roles.constant';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  update(@Param() params: IdParamDto, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(params.id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(ADMIN_ROLES.superAdmin)
  async remove(@Param() params: IdParamDto) {
    await this.categoriesService.remove(params.id);
  }
}
