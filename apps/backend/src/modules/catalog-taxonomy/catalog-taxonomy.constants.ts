export const fixedCatalogCategories = [
  { name: 'Anéis', slug: 'aneis', displayOrder: 10 },
  { name: 'Brincos', slug: 'brincos', displayOrder: 20 },
  { name: 'Colares', slug: 'colares', displayOrder: 30 },
  { name: 'Pulseiras', slug: 'pulseiras', displayOrder: 40 },
] as const;

export const fixedCatalogMaterials = [
  { name: 'Prata', slug: 'prata', displayOrder: 10 },
  { name: 'Dourado', slug: 'dourado', displayOrder: 20 },
] as const;

export const fixedCatalogCategorySlugs: readonly string[] = fixedCatalogCategories.map(
  (category) => category.slug,
);

export const fixedCatalogMaterialSlugs: readonly string[] = fixedCatalogMaterials.map(
  (material) => material.slug,
);
