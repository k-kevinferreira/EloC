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

import { CreateEntryDto } from './dto/create-entry.dto';
import { ListEntriesQueryDto } from './dto/list-entries-query.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { EntriesService } from './entries.service';

@Controller('admin/entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminEntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  findAll(@Query() query: ListEntriesQueryDto) {
    return this.entriesService.findAll(query);
  }

  @Post()
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  create(@Body() createEntryDto: CreateEntryDto) {
    return this.entriesService.create(createEntryDto);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLES.admin, ADMIN_ROLES.superAdmin)
  update(@Param() params: IdParamDto, @Body() updateEntryDto: UpdateEntryDto) {
    return this.entriesService.update(params.id, updateEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(ADMIN_ROLES.superAdmin)
  async remove(@Param() params: IdParamDto) {
    await this.entriesService.remove(params.id);
  }
}
