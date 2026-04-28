import { PrismaClient } from '@prisma/client';

import {
  fixedCatalogCategories,
  fixedCatalogMaterials,
} from 'src/modules/catalog-taxonomy/catalog-taxonomy.constants';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Catalog taxonomy seeded successfully.');
}

void main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error while seeding catalog taxonomy.';

    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
