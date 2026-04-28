import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type { Category, CategoryMutationInput } from '@/types/catalog/catalog.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function createCategory(input: CategoryMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Category>('admin/categories', {
    method: 'POST',
    accessToken,
    body: input,
  });
}

export async function updateCategory(id: string, input: CategoryMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Category>(`admin/categories/${id}`, {
    method: 'PATCH',
    accessToken,
    body: input,
  });
}

export async function deleteCategory(id: string) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<null>(`admin/categories/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}
