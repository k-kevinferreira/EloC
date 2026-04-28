import { PrismaClient } from '@prisma/client';

import {
  fixedCatalogCategories,
  fixedCatalogMaterials,
} from 'src/modules/catalog-taxonomy/catalog-taxonomy.constants';

const prisma = new PrismaClient();

const demoProducts = [
  {
    categorySlug: 'aneis',
    code: 'TEST-ANEL-PRATA-001',
    slug: 'anel-prata-pedra-verde',
    title: 'Anel Prata Pedra Verde',
    shortDescription:
      'Anel em acabamento prateado com pedra verde delicada para compor producoes leves.',
    description:
      'Peca de teste para validar a vitrine publica, a categoria Aneis e o material Prata no catalogo EloC.',
    price: 129.9,
    imageUrl: '/catalog/test/anel-prata.jpeg',
    altText: 'Anel prata com pedra verde usado na mao',
    displayOrder: 10,
    isFeatured: true,
  },
  {
    categorySlug: 'brincos',
    code: 'TEST-BRINCO-PRATA-001',
    slug: 'brinco-prata-argolas-cravejadas',
    title: 'Brinco Prata Argolas Cravejadas',
    shortDescription:
      'Conjunto de argolas prateadas com brilho discreto para uso diario ou ocasioes especiais.',
    description:
      'Peca de teste para validar a vitrine publica, a categoria Brincos e o material Prata no catalogo EloC.',
    price: 159.9,
    imageUrl: '/catalog/test/brinco-prata.jpeg',
    altText: 'Brincos prata em argolas cravejadas na orelha',
    displayOrder: 20,
    isFeatured: true,
  },
  {
    categorySlug: 'colares',
    code: 'TEST-COLAR-PRATA-001',
    slug: 'colar-prata-coracao',
    title: 'Colar Prata Coracao',
    shortDescription:
      'Colar prateado com pingente de coracao, visual romantico e acabamento delicado.',
    description:
      'Peca de teste para validar a vitrine publica, a categoria Colares e o material Prata no catalogo EloC.',
    price: 189.9,
    imageUrl: '/catalog/test/colar-prata.jpeg',
    altText: 'Colar prata com pingente de coracao',
    displayOrder: 30,
    isFeatured: true,
  },
];

async function main() {
  await seedTaxonomy();

  const silverMaterial = fixedCatalogMaterials.find(
    (material) => material.slug === 'prata',
  );

  if (!silverMaterial) {
    throw new Error('Fixed material "prata" was not found.');
  }

  for (const demoProduct of demoProducts) {
    const category = await prisma.category.findUnique({
      where: {
        slug: demoProduct.categorySlug,
      },
    });

    if (!category) {
      throw new Error(`Category "${demoProduct.categorySlug}" was not found.`);
    }

    const subcategory = await prisma.subcategory.findFirst({
      where: {
        categoryId: category.id,
        slug: silverMaterial.slug,
      },
    });

    if (!subcategory) {
      throw new Error(
        `Material "${silverMaterial.slug}" was not found for category "${category.slug}".`,
      );
    }

    const product = await prisma.product.upsert({
      where: {
        slug: demoProduct.slug,
      },
      create: {
        categoryId: category.id,
        subcategoryId: subcategory.id,
        code: demoProduct.code,
        slug: demoProduct.slug,
        title: demoProduct.title,
        shortDescription: demoProduct.shortDescription,
        description: demoProduct.description,
        price: demoProduct.price,
        imageUrl: demoProduct.imageUrl,
        isFeatured: demoProduct.isFeatured,
        isActive: true,
        displayOrder: demoProduct.displayOrder,
      },
      update: {
        categoryId: category.id,
        subcategoryId: subcategory.id,
        code: demoProduct.code,
        title: demoProduct.title,
        shortDescription: demoProduct.shortDescription,
        description: demoProduct.description,
        price: demoProduct.price,
        imageUrl: demoProduct.imageUrl,
        isFeatured: demoProduct.isFeatured,
        isActive: true,
        displayOrder: demoProduct.displayOrder,
      },
    });

    await prisma.productImage.deleteMany({
      where: {
        productId: product.id,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: demoProduct.imageUrl,
        altText: demoProduct.altText,
        displayOrder: 0,
        isPrimary: true,
      },
    });
  }

  console.log('Demo products seeded successfully.');
}

async function seedTaxonomy() {
  for (const category of fixedCatalogCategories) {
    const persistedCategory = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      create: {
        name: category.name,
        slug: category.slug,
        displayOrder: category.displayOrder,
        isActive: true,
      },
      update: {
        name: category.name,
        displayOrder: category.displayOrder,
        isActive: true,
      },
    });

    for (const material of fixedCatalogMaterials) {
      const existingMaterial = await prisma.subcategory.findFirst({
        where: {
          categoryId: persistedCategory.id,
          slug: material.slug,
        },
      });

      if (existingMaterial) {
        await prisma.subcategory.update({
          where: {
            id: existingMaterial.id,
          },
          data: {
            name: material.name,
            displayOrder: material.displayOrder,
            isActive: true,
          },
        });

        continue;
      }

      await prisma.subcategory.create({
        data: {
          categoryId: persistedCategory.id,
          name: material.name,
          slug: material.slug,
          displayOrder: material.displayOrder,
          isActive: true,
        },
      });
    }
  }
}

void main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error while seeding demo products.';

    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
