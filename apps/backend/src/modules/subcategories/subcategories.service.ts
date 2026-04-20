import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { ListSubcategoriesQueryDto } from './dto/list-subcategories-query.dto';

@Injectable()
export class SubcategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: ListSubcategoriesQueryDto) {
    return this.prismaService.subcategory.findMany({
      where: {
        categoryId: query.categoryId,
        isActive: query.isActive,
      },
      include: {
        category: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
}
