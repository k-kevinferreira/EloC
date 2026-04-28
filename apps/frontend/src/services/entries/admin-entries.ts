import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type {
  SaleEntry,
  SaleEntryMutationInput,
} from '@/types/operations/operations.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessao administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function listEntries() {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<SaleEntry[]>('admin/entries?limit=100', {
    method: 'GET',
    accessToken,
  });
}

export async function createEntry(input: SaleEntryMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<SaleEntry>('admin/entries', {
    method: 'POST',
    accessToken,
    body: input,
  });
}

export async function deleteEntry(id: string) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<null>(`admin/entries/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}
