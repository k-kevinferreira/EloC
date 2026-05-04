import { copyFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sourceDirectory = 'C:/Users/Kkevi/Downloads';
const uploadsRoot = resolve(process.cwd(), process.env.UPLOADS_LOCAL_ROOT ?? 'uploads');
const productImagesDirectory = join(uploadsRoot, 'product-images');
const publicUploadsBaseUrl =
  process.env.UPLOADS_PUBLIC_BASE_URL ?? 'http://localhost:3001/uploads';

const products = [
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (8).jpeg',
    filename: 'colar-gravatinha-delicado-zirconias.jpeg',
    code: 'COL-DOURADO-GRAVATINHA-ZIRCONIAS-001',
    slug: 'colar-gravatinha-delicado-zirconias',
    title: 'Colar gravatinha delicado com zircônias',
    shortDescription:
      'Colar dourado em estilo gravatinha, com detalhe central delicado cravejado em zircônias. Uma peça elegante, alongada e sofisticada para composições modernas.',
    altText: 'Colar dourado gravatinha delicado com zircônias',
    displayOrder: 100,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (7).jpeg',
    filename: 'colar-coracao-pedras-coloridas.jpeg',
    code: 'COL-DOURADO-CORACAO-COLORIDO-001',
    slug: 'colar-coracao-pedras-coloridas',
    title: 'Colar coração com pedras coloridas',
    shortDescription:
      'Colar dourado com pingente de coração preenchido por pedras coloridas, trazendo brilho e charme ao visual. Ideal para quem gosta de peças românticas com toque alegre.',
    altText: 'Colar dourado com pingente de coração e pedras coloridas',
    displayOrder: 110,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (6).jpeg',
    filename: 'colar-redondo-espirito-santo-zirconias.jpeg',
    code: 'COL-DOURADO-ESPIRITO-SANTO-001',
    slug: 'colar-redondo-espirito-santo-zirconias',
    title: 'Colar redondo Espírito Santo com zircônias',
    shortDescription:
      'Colar dourado com pingente redondo de Espírito Santo, contornado por zircônias brilhantes. Uma peça delicada, simbólica e cheia de significado.',
    altText: 'Colar dourado redondo do Espírito Santo com zircônias',
    displayOrder: 120,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (5).jpeg',
    filename: 'colar-medalha-circular-zirconias.jpeg',
    code: 'COL-DOURADO-MEDALHA-CIRCULAR-001',
    slug: 'colar-medalha-circular-zirconias',
    title: 'Colar medalha circular com zircônias',
    shortDescription:
      'Colar dourado com pingente circular moderno, detalhe central escuro e aro externo cravejado em zircônias. Sofisticado e versátil para uso diário ou ocasiões especiais.',
    altText: 'Colar dourado com medalha circular e zircônias',
    displayOrder: 130,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (4).jpeg',
    filename: 'colar-pedras-pretas.jpeg',
    code: 'COL-DOURADO-PEDRAS-PRETAS-001',
    slug: 'colar-com-pedras-pretas',
    title: 'Colar com pedras pretas',
    shortDescription:
      'Colar com pedras pretas facetadas e detalhes dourados, trazendo contraste elegante e presença ao visual. Perfeito para composições clássicas e sofisticadas.',
    altText: 'Colar com pedras pretas facetadas e detalhes dourados',
    displayOrder: 140,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (3).jpeg',
    filename: 'conjunto-trevo-zirconias.jpeg',
    code: 'CONJ-DOURADO-TREVO-ZIRCONIAS-001',
    slug: 'conjunto-trevo-zirconias',
    title: 'Conjunto trevo com zircônias',
    shortDescription:
      'Conjunto dourado com colar e brincos em formato de trevo, todo cravejado em zircônias. Delicado, feminino e ideal para quem busca brilho na medida certa.',
    altText: 'Conjunto dourado de colar e brincos trevo com zircônias',
    displayOrder: 150,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (2).jpeg',
    filename: 'colar-ponto-luz-gota.jpeg',
    code: 'COL-DOURADO-PONTO-LUZ-GOTA-001',
    slug: 'colar-ponto-de-luz-gota',
    title: 'Colar ponto de luz gota',
    shortDescription:
      'Colar dourado com pingente em formato de gota e pedra clara central. Uma peça minimalista, delicada e elegante para usar em qualquer ocasião.',
    altText: 'Colar dourado ponto de luz com pingente em formato de gota',
    displayOrder: 160,
  },
  {
    sourceFile: 'WhatsApp Image 2026-05-03 at 13.26.35 (1).jpeg',
    filename: 'colar-duplo-coracoes.jpeg',
    code: 'COL-DOURADO-DUPLO-CORACOES-001',
    slug: 'colar-duplo-de-coracoes',
    title: 'Colar duplo de corações',
    shortDescription:
      'Colar dourado em camadas com pingentes de coração vazado. Romântico, moderno e versátil, ideal para valorizar o colo com delicadeza.',
    altText: 'Colar dourado duplo de corações vazados',
    displayOrder: 170,
  },
];

async function main() {
  const category = await prisma.category.findUnique({
    where: {
      slug: 'colares',
    },
  });

  if (!category) {
    throw new Error('Category "colares" was not found.');
  }

  const subcategory = await prisma.subcategory.findFirst({
    where: {
      categoryId: category.id,
      slug: 'dourado',
    },
  });

  if (!subcategory) {
    throw new Error('Material "dourado" was not found for category "colares".');
  }

  await mkdir(productImagesDirectory, { recursive: true });

  for (const productInput of products) {
    const imageUrl = `${publicUploadsBaseUrl.replace(/\/$/, '')}/product-images/${
      productInput.filename
    }`;

    await copyFile(
      join(sourceDirectory, productInput.sourceFile),
      join(productImagesDirectory, productInput.filename),
    );

    const product = await prisma.product.upsert({
      where: {
        slug: productInput.slug,
      },
      create: {
        categoryId: category.id,
        subcategoryId: subcategory.id,
        code: productInput.code,
        slug: productInput.slug,
        title: productInput.title,
        shortDescription: productInput.shortDescription,
        description: productInput.shortDescription,
        price: 0,
        imageUrl,
        isFeatured: false,
        isActive: true,
        displayOrder: productInput.displayOrder,
      },
      update: {
        categoryId: category.id,
        subcategoryId: subcategory.id,
        code: productInput.code,
        title: productInput.title,
        shortDescription: productInput.shortDescription,
        description: productInput.shortDescription,
        price: 0,
        imageUrl,
        isActive: true,
        displayOrder: productInput.displayOrder,
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
        url: imageUrl,
        altText: productInput.altText,
        displayOrder: 0,
        isPrimary: true,
      },
    });

    console.log(`Seeded product: ${productInput.title}`);
  }
}

void main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error while seeding new necklace products.';

    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
