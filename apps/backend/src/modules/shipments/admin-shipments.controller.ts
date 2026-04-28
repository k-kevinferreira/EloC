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

import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ShipmentsService } from './shipments.service';

@Controller('admin/shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  findAll(@Query() query: ListShipmentsQueryDto) {
    return this.shipmentsService.findAll(query);
  }

  @Post()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  update(@Param() params: IdParamDto, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(params.id, updateShipmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(ADMIN_ROLES.superAdmin)
  async remove(@Param() params: IdParamDto) {
    await this.shipmentsService.remove(params.id);
  }
}
