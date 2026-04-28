import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type {
  Subcategory,
  SubcategoryMutationInput,
} from '@/types/catalog/catalog.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function createSubcategory(input: SubcategoryMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Subcategory>('admin/subcategories', {
    method: 'POST',
    accessToken,
    body: input,
  });
}

export async function updateSubcategory(
  id: string,
  input: SubcategoryMutationInput,
) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Subcategory>(`admin/subcategories/${id}`, {
    method: 'PATCH',
    accessToken,
    body: input,
  });
}

export async function deleteSubcategory(id: string) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<null>(`admin/subcategories/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}
