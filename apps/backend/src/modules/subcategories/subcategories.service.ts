import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { normalizeSlug, normalizeText } from 'src/common/utils/normalizers';
import { fixedCatalogMaterialSlugs } from 'src/modules/catalog-taxonomy/catalog-taxonomy.constants';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { ListSubcategoriesQueryDto } from './dto/list-subcategories-query.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

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

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    this.assertFixedMaterialSlug(createSubcategoryDto.slug);
    await this.assertCategoryExists(createSubcategoryDto.categoryId);
    await this.assertSlugAvailable(
      createSubcategoryDto.categoryId,
      createSubcategoryDto.slug,
    );

    return this.prismaService.subcategory.create({
      data: {
        categoryId: createSubcategoryDto.categoryId,
        name: normalizeText(createSubcategoryDto.name),
        slug: normalizeSlug(createSubcategoryDto.slug),
        isActive: createSubcategoryDto.isActive ?? true,
        displayOrder: createSubcategoryDto.displayOrder ?? 0,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, updateSubcategoryDto: UpdateSubcategoryDto) {
    const subcategory = await this.findByIdOrThrow(id);
    const nextCategoryId = updateSubcategoryDto.categoryId ?? subcategory.categoryId;
    const nextSlug = updateSubcategoryDto.slug ?? subcategory.slug;

    if (updateSubcategoryDto.categoryId !== undefined) {
      await this.assertCategoryExists(updateSubcategoryDto.categoryId);
    }

    if (updateSubcategoryDto.slug !== undefined) {
      this.assertFixedMaterialSlug(updateSubcategoryDto.slug);
    }

    if (
      nextCategoryId !== subcategory.categoryId ||
      normalizeSlug(nextSlug) !== subcategory.slug
    ) {
      await this.assertSlugAvailable(nextCategoryId, nextSlug, subcategory.id);
    }

    return this.prismaService.subcategory.update({
      where: { id },
      data: {
        ...(updateSubcategoryDto.categoryId !== undefined && {
          categoryId: updateSubcategoryDto.categoryId,
        }),
        ...(updateSubcategoryDto.name !== undefined && {
          name: normalizeText(updateSubcategoryDto.name),
        }),
        ...(updateSubcategoryDto.slug !== undefined && {
          slug: normalizeSlug(updateSubcategoryDto.slug),
        }),
        ...(updateSubcategoryDto.isActive !== undefined && {
          isActive: updateSubcategoryDto.isActive,
        }),
        ...(updateSubcategoryDto.displayOrder !== undefined && {
          displayOrder: updateSubcategoryDto.displayOrder,
        }),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with id "${id}" was not found.`);
    }

    const subcategoryWithSlug = await this.prismaService.subcategory.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (
      subcategoryWithSlug &&
      fixedCatalogMaterialSlugs.includes(subcategoryWithSlug.slug)
    ) {
      throw new ConflictException('Fixed catalog materials cannot be removed.');
    }

    if (subcategory._count.products > 0) {
      throw new ConflictException(
        'Subcategory cannot be removed while it still has related products.',
      );
    }

    await this.prismaService.subcategory.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string) {
    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with id "${id}" was not found.`);
    }

    return subcategory;
  }

  private async assertCategoryExists(categoryId: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" was not found.`);
    }
  }

  private async assertSlugAvailable(
    categoryId: string,
    slug: string,
    currentSubcategoryId?: string,
  ) {
    const existingSubcategory = await this.prismaService.subcategory.findFirst({
      where: {
        categoryId,
        slug: normalizeSlug(slug),
      },
      select: {
        id: true,
      },
    });

    if (existingSubcategory && existingSubcategory.id !== currentSubcategoryId) {
      throw new ConflictException(
        `Subcategory slug "${slug}" is already in use for this category.`,
      );
    }
  }

  private assertFixedMaterialSlug(slug: string) {
    const normalizedSlug = normalizeSlug(slug);

    if (!fixedCatalogMaterialSlugs.includes(normalizedSlug)) {
      throw new BadRequestException(
        `Subcategory slug must be one of: ${fixedCatalogMaterialSlugs.join(', ')}.`,
      );
    }
  }
}
