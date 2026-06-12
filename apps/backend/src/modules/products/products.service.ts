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
import { ProductImageInputDto } from './dto/product-image-input.dto';
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

type CreateTelegramAiProductInput = {
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  imageUrl: string;
  suggestedCategory: string;
  suggestedMaterial: 'prata' | 'dourado';
  aiTags: string[];
};

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findPublicAll(query: ListProductsQueryDto) {
    return this.findAll({
      ...query,
      isActive: true,
    });
  }

  async findAll(query: ListProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {
      categoryId: query.categoryId,
      subcategoryId: query.subcategoryId,
      subcategory: query.subcategorySlug
        ? {
            slug: query.subcategorySlug,
          }
        : undefined,
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
    const product = await this.prismaService.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    return this.serializeProduct(product);
  }

  async createTelegramAiProduct(input: CreateTelegramAiProductInput) {
    const productTaxonomy = await this.resolveTelegramProductTaxonomy(
      input.suggestedCategory,
      input.suggestedMaterial,
    );
    const title = normalizeText(input.title || 'Produto pendente de revisão').slice(
      0,
      160,
    );
    const code = await this.generateAvailableProductCode(title);
    const slug = await this.generateAvailableProductSlug(title);

    const product = await this.prismaService.product.create({
      data: {
        categoryId: productTaxonomy.categoryId,
        subcategoryId: productTaxonomy.subcategoryId,
        code,
        slug,
        title,
        shortDescription: normalizeOptionalText(input.shortDescription),
        description: normalizeOptionalText(input.description),
        price: input.price,
        imageUrl: input.imageUrl,
        source: 'TELEGRAM_AI',
        aiGenerated: true,
        suggestedCategory: normalizeOptionalText(input.suggestedCategory),
        aiTags: input.aiTags.slice(0, 10),
        isFeatured: false,
        isActive: false,
        displayOrder: 0,
        images: {
          create: [
            {
              url: input.imageUrl,
              altText: title,
              displayOrder: 0,
              isPrimary: true,
            },
          ],
        },
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async updateTelegramAiProductTitle(id: string, title: string) {
    const normalizedTitle = normalizeText(title).slice(0, 160);

    if (!normalizedTitle) {
      throw new BadRequestException('Product title is required.');
    }

    const product = await this.prismaService.product.update({
      where: {
        id,
        source: 'TELEGRAM_AI',
      },
      data: {
        title: normalizedTitle,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async updateTelegramAiProductShortDescription(id: string, shortDescription: string) {
    const normalizedShortDescription = normalizeText(shortDescription).slice(0, 500);

    if (!normalizedShortDescription) {
      throw new BadRequestException('Product description is required.');
    }

    const product = await this.prismaService.product.update({
      where: {
        id,
        source: 'TELEGRAM_AI',
      },
      data: {
        shortDescription: normalizedShortDescription,
        description: normalizedShortDescription,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async updateTelegramAiProductSuggestedCategory(
    id: string,
    suggestedCategory: string,
  ) {
    const normalizedSuggestedCategory = normalizeText(suggestedCategory).slice(0, 120);

    if (!normalizedSuggestedCategory) {
      throw new BadRequestException('Suggested category is required.');
    }

    const currentProduct = await this.findByIdOrThrow(id);
    const productTaxonomy = await this.resolveTelegramProductTaxonomy(
      normalizedSuggestedCategory,
      currentProduct.subcategory?.slug,
    );
    const product = await this.prismaService.product.update({
      where: {
        id,
        source: 'TELEGRAM_AI',
      },
      data: {
        categoryId: productTaxonomy.categoryId,
        subcategoryId: productTaxonomy.subcategoryId,
        suggestedCategory: normalizedSuggestedCategory,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async updateTelegramAiProductSuggestedMaterial(id: string, suggestedMaterial: string) {
    const normalizedSuggestedMaterial = this.normalizeTelegramProductMaterial(
      suggestedMaterial,
    );

    if (!normalizedSuggestedMaterial) {
      throw new BadRequestException('Suggested material must be Prata or Dourado.');
    }

    const currentProduct = await this.findByIdOrThrow(id);
    const productTaxonomy = await this.resolveTelegramProductTaxonomy(
      currentProduct.suggestedCategory ?? currentProduct.category.name,
      normalizedSuggestedMaterial,
    );
    const product = await this.prismaService.product.update({
      where: {
        id,
        source: 'TELEGRAM_AI',
      },
      data: {
        subcategoryId: productTaxonomy.subcategoryId,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async activateTelegramAiProduct(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id,
        source: 'TELEGRAM_AI',
      },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    if (product.category.slug === 'revisar') {
      throw new BadRequestException(
        'Select a real category before publishing this product.',
      );
    }

    if (!product.subcategory || !['prata', 'dourado'].includes(product.subcategory.slug)) {
      throw new BadRequestException(
        'Select a real material before publishing this product.',
      );
    }

    const updatedProduct = await this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
      include: productInclude,
    });

    return this.serializeProduct(updatedProduct);
  }

  async create(createProductDto: CreateProductDto) {
    await this.assertCategoryExists(createProductDto.categoryId);
    await this.assertCodeAvailable(createProductDto.code);
    await this.assertSlugAvailable(createProductDto.slug);

    const subcategoryId = await this.resolveSubcategoryIdOrThrow(
      createProductDto.categoryId,
      createProductDto.subcategoryId,
    );

    const normalizedImages = this.resolveNormalizedImagesInput(
      createProductDto.images,
      createProductDto.imageUrl,
    );
    const primaryImageUrl = this.resolvePrimaryImageUrl(normalizedImages);

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
        imageUrl: primaryImageUrl,
        ...(normalizedImages.length > 0 && {
          images: {
            create: normalizedImages,
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
    const shouldSyncImages = Object.prototype.hasOwnProperty.call(updateProductDto, 'images');
    const nextImages = shouldSyncImages
      ? this.resolveNormalizedImagesInput(updateProductDto.images)
      : shouldSyncLegacyImage
        ? this.resolveNormalizedImagesInput(undefined, updateProductDto.imageUrl)
        : null;
    const nextPrimaryImageUrl =
      nextImages === null ? undefined : this.resolvePrimaryImageUrl(nextImages);

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
          ...(nextImages !== null && {
            imageUrl: nextPrimaryImageUrl,
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

      if (nextImages !== null) {
        await this.replaceProductImages(tx, id, nextImages);
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

  private async replaceProductImages(
    tx: Prisma.TransactionClient,
    productId: string,
    images: NormalizedProductImageInput[],
  ) {
    await tx.productImage.deleteMany({
      where: { productId },
    });

    if (images.length === 0) {
      return;
    }

    await tx.productImage.createMany({
      data: images.map((image) => ({
        productId,
        ...image,
      })),
    });
  }

  private resolveNormalizedImagesInput(
    images?: ProductImageInputDto[] | null,
    legacyImageUrl?: string | null,
  ): NormalizedProductImageInput[] {
    if (images !== undefined) {
      if (images === null) {
        return [];
      }

      return this.normalizeImages(images);
    }

    const normalizedLegacyImageUrl = normalizeOptionalText(legacyImageUrl);

    if (!normalizedLegacyImageUrl) {
      return [];
    }

    return [
      {
        url: normalizedLegacyImageUrl,
        altText: null,
        displayOrder: 0,
        isPrimary: true,
      },
    ];
  }

  private normalizeImages(images: ProductImageInputDto[]): NormalizedProductImageInput[] {
    if (images.length === 0) {
      return [];
    }

    const normalizedImages = images.map((image, index) => ({
      url: normalizeText(image.url),
      altText: normalizeOptionalText(image.altText) ?? null,
      displayOrder: image.displayOrder ?? index,
      isPrimary: image.isPrimary ?? false,
    }));

    const primaryImages = normalizedImages.filter((image) => image.isPrimary);

    if (primaryImages.length > 1) {
      throw new BadRequestException('Provide only one primary image per product.');
    }

    if (primaryImages.length === 0) {
      normalizedImages[0] = {
        ...normalizedImages[0],
        isPrimary: true,
      };
    }

    return normalizedImages;
  }

  private resolvePrimaryImageUrl(images: NormalizedProductImageInput[]) {
    return images.find((image) => image.isPrimary)?.url ?? null;
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
    subcategoryId?: string,
  ) {
    if (!subcategoryId) {
      throw new BadRequestException('Product subcategory is required.');
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
        'When changing the product category, provide a compatible subcategory.',
      );
    }

    return product.subcategoryId;
  }

  private async resolveReviewTaxonomyOrThrow() {
    const category = await this.prismaService.category.findUnique({
      where: {
        slug: 'revisar',
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Review category was not found.');
    }

    const subcategory = await this.prismaService.subcategory.findFirst({
      where: {
        categoryId: category.id,
        slug: 'revisar',
      },
      select: {
        id: true,
      },
    });

    if (!subcategory) {
      throw new NotFoundException('Review subcategory was not found.');
    }

    return {
      categoryId: category.id,
      subcategoryId: subcategory.id,
    };
  }

  private async resolveTelegramProductTaxonomy(
    suggestedCategory: string,
    suggestedMaterial?: string | null,
  ) {
    const matchedCategory = await this.findCategoryMatchingSuggestion(
      suggestedCategory,
    );
    const matchedMaterial = await this.findMaterialMatchingSuggestion(
      suggestedMaterial,
    );

    if (matchedCategory) {
      return {
        categoryId: matchedCategory.id,
        subcategoryId: matchedMaterial?.id ?? null,
      };
    }

    return this.resolveReviewTaxonomyOrThrow();
  }

  private async findCategoryMatchingSuggestion(suggestedCategory: string) {
    const normalizedSuggestion = this.slugifyProductText(suggestedCategory);

    if (!normalizedSuggestion) {
      return null;
    }

    const categories = await this.prismaService.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return (
      categories.find((category) => {
        return (
          category.slug === normalizedSuggestion ||
          this.slugifyProductText(category.name) === normalizedSuggestion
        );
      }) ?? null
    );
  }

  private async findMaterialMatchingSuggestion(suggestedMaterial?: string | null) {
    const normalizedMaterial = this.normalizeTelegramProductMaterial(
      suggestedMaterial,
    );

    if (!normalizedMaterial) {
      return null;
    }

    return this.prismaService.subcategory.findFirst({
      where: {
        slug: normalizedMaterial,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  private normalizeTelegramProductMaterial(value?: string | null) {
    if (!value) {
      return null;
    }

    const normalizedValue = this.slugifyProductText(value);

    if (normalizedValue === 'prata' || normalizedValue === 'dourado') {
      return normalizedValue;
    }

    return null;
  }

  private async generateAvailableProductCode(title: string) {
    const baseCode = this.slugifyProductText(title)
      .toUpperCase()
      .slice(0, 40) || 'PRODUTO';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = `${Date.now().toString(36)}${attempt ? `-${attempt}` : ''}`
        .toUpperCase()
        .slice(0, 16);
      const code = normalizeCode(`TG-${baseCode}-${suffix}`).slice(0, 80);
      const existingProduct = await this.prismaService.product.findUnique({
        where: {
          code,
        },
        select: {
          id: true,
        },
      });

      if (!existingProduct) {
        return code;
      }
    }

    throw new ConflictException('Could not generate a unique product code.');
  }

  private async generateAvailableProductSlug(title: string) {
    const baseSlug = this.slugifyProductText(title).slice(0, 120) || 'produto';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = `${Date.now().toString(36)}${attempt ? `-${attempt}` : ''}`;
      const slug = normalizeSlug(`${baseSlug}-${suffix}`).slice(0, 160);
      const existingProduct = await this.prismaService.product.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

      if (!existingProduct) {
        return slug;
      }
    }

    throw new ConflictException('Could not generate a unique product slug.');
  }

  private slugifyProductText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }
}

type NormalizedProductImageInput = {
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
};
