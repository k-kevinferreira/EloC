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
  images: ProductImage[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  subcategory: Subcategory | null;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductMutationInput = {
  categoryId: string;
  subcategoryId: string | null;
  code: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
};
