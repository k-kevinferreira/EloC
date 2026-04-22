export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryMutationInput = {
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
};

export type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export type SubcategoryMutationInput = {
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
};

export type Product = {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  code: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  subcategory: Subcategory | null;
};
