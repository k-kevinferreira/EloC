import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  normalizeCode,
  normalizeOptionalText,
  normalizeSlug,
  normalizeText,
} from 'src/common/utils/normalizers';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: true,
  subcategory: true,
  images: {
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    subcategory: true;
    images: true;
  };
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: ListProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {
      categoryId: query.categoryId,
      subcategoryId: query.subcategoryId,
      isActive: query.isActive,
      isFeatured: query.isFeatured,
    };

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const products = await this.prismaService.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async findBySlug(slug: string) {
    const product = await this.prismaService.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    return this.serializeProduct(product);
  }

  async create(createProductDto: CreateProductDto) {
    await this.assertCategoryExists(createProductDto.categoryId);
    await this.assertCodeAvailable(createProductDto.code);
    await this.assertSlugAvailable(createProductDto.slug);

    const subcategoryId = await this.resolveSubcategoryIdOrThrow(
      createProductDto.categoryId,
      createProductDto.subcategoryId,
    );

    const normalizedImageUrl = normalizeOptionalText(createProductDto.imageUrl);

    const product = await this.prismaService.product.create({
      data: {
        categoryId: createProductDto.categoryId,
        subcategoryId,
        code: normalizeCode(createProductDto.code),
        slug: normalizeSlug(createProductDto.slug),
        title: normalizeText(createProductDto.title),
        shortDescription: normalizeOptionalText(createProductDto.shortDescription),
        description: normalizeOptionalText(createProductDto.description),
        price: createProductDto.price,
        imageUrl: normalizedImageUrl,
        ...(normalizedImageUrl && {
          images: {
            create: this.buildPrimaryImageCreateInput(normalizedImageUrl),
          },
        }),
        isFeatured: createProductDto.isFeatured ?? false,
        isActive: createProductDto.isActive ?? true,
        displayOrder: createProductDto.displayOrder ?? 0,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findByIdOrThrow(id);
    if (updateProductDto.categoryId !== undefined) {
      await this.assertCategoryExists(updateProductDto.categoryId);
    }

    const nextCategoryId = updateProductDto.categoryId ?? product.categoryId;
    const nextSubcategoryId = await this.resolveNextSubcategoryId(
      product,
      updateProductDto,
      nextCategoryId,
    );

    if (
      updateProductDto.code !== undefined &&
      normalizeCode(updateProductDto.code) !== product.code
    ) {
      await this.assertCodeAvailable(updateProductDto.code, product.id);
    }

    if (
      updateProductDto.slug !== undefined &&
      normalizeSlug(updateProductDto.slug) !== product.slug
    ) {
      await this.assertSlugAvailable(updateProductDto.slug, product.id);
    }

    const shouldSyncLegacyImage = Object.prototype.hasOwnProperty.call(
      updateProductDto,
      'imageUrl',
    );
    const normalizedImageUrl = shouldSyncLegacyImage
      ? normalizeOptionalText(updateProductDto.imageUrl)
      : undefined;

    const updatedProduct = await this.prismaService.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(updateProductDto.categoryId !== undefined && {
            categoryId: updateProductDto.categoryId,
          }),
          ...(Object.prototype.hasOwnProperty.call(updateProductDto, 'subcategoryId') && {
            subcategoryId: nextSubcategoryId,
          }),
          ...(updateProductDto.code !== undefined && {
            code: normalizeCode(updateProductDto.code),
          }),
          ...(updateProductDto.slug !== undefined && {
            slug: normalizeSlug(updateProductDto.slug),
          }),
          ...(updateProductDto.title !== undefined && {
            title: normalizeText(updateProductDto.title),
          }),
          ...(Object.prototype.hasOwnProperty.call(updateProductDto, 'shortDescription') && {
            shortDescription: normalizeOptionalText(updateProductDto.shortDescription),
          }),
          ...(Object.prototype.hasOwnProperty.call(updateProductDto, 'description') && {
            description: normalizeOptionalText(updateProductDto.description),
          }),
          ...(updateProductDto.price !== undefined && {
            price: updateProductDto.price,
          }),
          ...(shouldSyncLegacyImage && {
            imageUrl: normalizedImageUrl,
          }),
          ...(updateProductDto.isFeatured !== undefined && {
            isFeatured: updateProductDto.isFeatured,
          }),
          ...(updateProductDto.isActive !== undefined && {
            isActive: updateProductDto.isActive,
          }),
          ...(updateProductDto.displayOrder !== undefined && {
            displayOrder: updateProductDto.displayOrder,
          }),
        },
      });

      if (shouldSyncLegacyImage) {
        await this.syncPrimaryImageFromLegacyField(tx, id, normalizedImageUrl);
      }

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: productInclude,
      });
    });

    return this.serializeProduct(updatedProduct);
  }

  async remove(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            saleEntries: true,
            shipmentItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    if (product._count.saleEntries > 0 || product._count.shipmentItems > 0) {
      throw new ConflictException(
        'Product cannot be removed while it still has related sales or shipment records.',
      );
    }

    await this.prismaService.product.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string): Promise<ProductWithRelations> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    return product;
  }

  private serializeProduct(product: ProductWithRelations) {
    const images = this.resolveProductImages(product);
    const primaryImage = images.find((image) => image.isPrimary) ?? images[0] ?? null;

    return {
      ...product,
      imageUrl: primaryImage?.url ?? product.imageUrl,
      images,
    };
  }

  private resolveProductImages(product: ProductWithRelations) {
    if (product.images.length > 0) {
      return product.images;
    }

    if (!product.imageUrl) {
      return [];
    }

    return [
      {
        id: `legacy-image-${product.id}`,
        productId: product.id,
        url: product.imageUrl,
        altText: null,
        displayOrder: 0,
        isPrimary: true,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    ];
  }

  private buildPrimaryImageCreateInput(imageUrl: string) {
    return {
      url: imageUrl,
      altText: null,
      displayOrder: 0,
      isPrimary: true,
    };
  }

  private async syncPrimaryImageFromLegacyField(
    tx: Prisma.TransactionClient,
    productId: string,
    imageUrl: string | null | undefined,
  ) {
    await tx.productImage.deleteMany({
      where: {
        productId,
        isPrimary: true,
      },
    });

    if (!imageUrl) {
      return;
    }

    await tx.productImage.create({
      data: {
        productId,
        ...this.buildPrimaryImageCreateInput(imageUrl),
      },
    });
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

  private async assertCodeAvailable(code: string, currentProductId?: string) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: {
        code: normalizeCode(code),
      },
      select: {
        id: true,
      },
    });

    if (existingProduct && existingProduct.id !== currentProductId) {
      throw new ConflictException(`Product code "${code}" is already in use.`);
    }
  }

  private async assertSlugAvailable(slug: string, currentProductId?: string) {
    const existingProduct = await this.prismaService.product.findUnique({
      where: {
        slug: normalizeSlug(slug),
      },
      select: {
        id: true,
      },
    });

    if (existingProduct && existingProduct.id !== currentProductId) {
      throw new ConflictException(`Product slug "${slug}" is already in use.`);
    }
  }

  private async resolveSubcategoryIdOrThrow(
    categoryId: string,
    subcategoryId?: string | null,
  ) {
    if (!subcategoryId) {
      return null;
    }

    const subcategory = await this.prismaService.subcategory.findUnique({
      where: { id: subcategoryId },
      select: {
        id: true,
        categoryId: true,
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with id "${subcategoryId}" was not found.`);
    }

    if (subcategory.categoryId !== categoryId) {
      throw new BadRequestException(
        'The provided subcategory does not belong to the provided category.',
      );
    }

    return subcategory.id;
  }

  private async resolveNextSubcategoryId(
    product: ProductWithRelations,
    updateProductDto: UpdateProductDto,
    nextCategoryId: string,
  ) {
    if (Object.prototype.hasOwnProperty.call(updateProductDto, 'subcategoryId')) {
      return this.resolveSubcategoryIdOrThrow(nextCategoryId, updateProductDto.subcategoryId);
    }

    if (
      updateProductDto.categoryId !== undefined &&
      product.subcategoryId &&
      product.subcategory?.categoryId !== nextCategoryId
    ) {
      throw new BadRequestException(
        'When changing the product category, provide a compatible subcategory or null.',
      );
    }

    return product.subcategoryId;
  }
}
