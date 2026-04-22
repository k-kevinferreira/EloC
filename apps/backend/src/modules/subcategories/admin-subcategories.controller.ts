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

import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { SubcategoriesService } from './subcategories.service';

@Controller('admin/subcategories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Post()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(createSubcategoryDto);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  update(
    @Param() params: IdParamDto,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(params.id, updateSubcategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(ADMIN_ROLES.superAdmin)
  async remove(@Param() params: IdParamDto) {
    await this.subcategoriesService.remove(params.id);
  }
}
