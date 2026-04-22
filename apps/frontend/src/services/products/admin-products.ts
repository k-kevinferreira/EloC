import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type { Product, ProductMutationInput } from '@/types/catalog/catalog.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessao administrativa expirou. Entre novamente.');
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
