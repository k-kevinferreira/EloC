import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { normalizeSlug, normalizeText } from 'src/common/utils/normalizers';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  async create(createCategoryDto: CreateCategoryDto) {
    await this.assertSlugAvailable(createCategoryDto.slug);

    return this.prismaService.category.create({
      data: {
        name: normalizeText(createCategoryDto.name),
        slug: normalizeSlug(createCategoryDto.slug),
        isActive: createCategoryDto.isActive ?? true,
        displayOrder: createCategoryDto.displayOrder ?? 0,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findByIdOrThrow(id);

    if (updateCategoryDto.slug !== undefined) {
      await this.assertSlugAvailable(updateCategoryDto.slug, category.id);
    }

    return this.prismaService.category.update({
      where: { id },
      data: {
        ...(updateCategoryDto.name !== undefined && {
          name: normalizeText(updateCategoryDto.name),
        }),
        ...(updateCategoryDto.slug !== undefined && {
          slug: normalizeSlug(updateCategoryDto.slug),
        }),
        ...(updateCategoryDto.isActive !== undefined && {
          isActive: updateCategoryDto.isActive,
        }),
        ...(updateCategoryDto.displayOrder !== undefined && {
          displayOrder: updateCategoryDto.displayOrder,
        }),
      },
    });
  }

  async remove(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            subcategories: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" was not found.`);
    }

    if (category._count.subcategories > 0 || category._count.products > 0) {
      throw new ConflictException(
        'Category cannot be removed while it still has related subcategories or products.',
      );
    }

    await this.prismaService.category.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" was not found.`);
    }

    return category;
  }

  private async assertSlugAvailable(slug: string, currentCategoryId?: string) {
    const existingCategory = await this.prismaService.category.findUnique({
      where: {
        slug: normalizeSlug(slug),
      },
      select: {
        id: true,
      },
    });

    if (existingCategory && existingCategory.id !== currentCategoryId) {
      throw new ConflictException(`Category slug "${slug}" is already in use.`);
    }
  }
}
