import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type { Product, ProductMutationInput } from '@/types/catalog/catalog.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function createProduct(input: ProductMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Product>('admin/products', {
    method: 'POST',
    accessToken,
    body: input,
  });
}

export async function listAdminProducts(options: {
  categoryId?: string;
  subcategoryId?: string;
  subcategorySlug?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const accessToken = await getRequiredAdminAccessToken();
  const searchParams = new URLSearchParams();

  if (options.categoryId) {
    searchParams.set('categoryId', options.categoryId);
  }

  if (options.subcategoryId) {
    searchParams.set('subcategoryId', options.subcategoryId);
  }

  if (options.subcategorySlug) {
    searchParams.set('subcategorySlug', options.subcategorySlug);
  }

  if (options.isActive !== undefined) {
    searchParams.set('isActive', String(options.isActive));
  }

  if (options.isFeatured !== undefined) {
    searchParams.set('isFeatured', String(options.isFeatured));
  }

  if (options.search) {
    searchParams.set('search', options.search);
  }

  if (options.limit !== undefined) {
    searchParams.set('limit', String(options.limit));
  }

  if (options.offset !== undefined) {
    searchParams.set('offset', String(options.offset));
  }

  const path =
    searchParams.size > 0 ? `admin/products?${searchParams}` : 'admin/products';

  return requestBackend<Product[]>(path, {
    method: 'GET',
    accessToken,
  });
}

export async function updateProduct(id: string, input: ProductMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Product>(`admin/products/${id}`, {
    method: 'PATCH',
    accessToken,
    body: input,
  });
}

export async function deleteProduct(id: string) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<null>(`admin/products/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}
