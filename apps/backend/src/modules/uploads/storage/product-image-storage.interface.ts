export type ProductImageStorageInput = {
  buffer: Buffer;
  filename: string;
  relativePath: string;
  mimeType: string;
  size: number;
};

export type StoredProductImage = {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

export interface ProductImageStorage {
  saveProductImage(input: ProductImageStorageInput): Promise<StoredProductImage>;
}

export const PRODUCT_IMAGE_STORAGE = Symbol('PRODUCT_IMAGE_STORAGE');
