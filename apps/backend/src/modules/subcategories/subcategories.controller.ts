import { Controller, Get, Query } from '@nestjs/common';

import { ListSubcategoriesQueryDto } from './dto/list-subcategories-query.dto';
import { SubcategoriesService } from './subcategories.service';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll(@Query() query: ListSubcategoriesQueryDto) {
    return this.subcategoriesService.findAll(query);
  }
}
