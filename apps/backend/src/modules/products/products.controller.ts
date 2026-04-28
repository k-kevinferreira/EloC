import { Controller, Get, Param, Query } from '@nestjs/common';

import { FindProductBySlugParamsDto } from './dto/find-product-by-slug-params.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  findBySlug(@Param() params: FindProductBySlugParamsDto) {
    return this.productsService.findBySlug(params.slug);
  }
}
