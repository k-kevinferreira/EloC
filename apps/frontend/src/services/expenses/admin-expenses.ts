import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type {
  Expense,
  ExpenseMutationInput,
} from '@/types/operations/operations.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function listExpenses() {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Expense[]>('admin/expenses?limit=100', {
    method: 'GET',
    accessToken,
  });
}

export async function createExpense(input: ExpenseMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Expense>('admin/expenses', {
    method: 'POST',
    accessToken,
    body: input,
  });
}

export async function deleteExpense(id: string) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<null>(`admin/expenses/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}
