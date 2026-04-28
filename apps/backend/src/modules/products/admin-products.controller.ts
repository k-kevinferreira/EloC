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

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  update(@Param() params: IdParamDto, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(params.id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(ADMIN_ROLES.superAdmin)
  async remove(@Param() params: IdParamDto) {
    await this.productsService.remove(params.id);
  }
}
