import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: ListCategoriesQueryDto) {
    return this.prismaService.category.findMany({
      where: {
        isActive: query.isActive,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
}
