'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import { createExpense, deleteExpense } from '@/services/expenses/admin-expenses';
import type { ExpenseMutationInput } from '@/types/operations/operations.types';

export type ExpenseFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  values: {
    type: string;
    description: string;
    amount: string;
    expenseDate: string;
  };
};

export type ExpenseDeleteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createExpenseAction(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const values = {
    type: String(formData.get('type') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    amount: String(formData.get('amount') ?? '').trim(),
    expenseDate: String(formData.get('expenseDate') ?? '').trim(),
  };
  const parsedAmount = Number(values.amount.replace(',', '.'));

  if (!values.type || !values.description || !values.expenseDate) {
    return {
      status: 'error',
      message: 'Informe tipo, descricao e data da despesa.',
      values,
    };
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return {
      status: 'error',
      message: 'Informe um valor valido para a despesa.',
      values,
    };
  }

  const input: ExpenseMutationInput = {
    shipmentId: null,
    type: values.type,
    description: values.description,
    amount: parsedAmount,
    expenseDate: values.expenseDate,
    notes: null,
  };

  try {
    await createExpense(input);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
      values,
    };
  }

  revalidatePath('/admin/expenses');
  revalidatePath('/admin/shipments');

  return {
    status: 'success',
    message: 'Despesa registrada com sucesso.',
    values: {
      type: '',
      description: '',
      amount: '',
      expenseDate: new Date().toISOString().slice(0, 10),
    },
  };
}

export async function deleteExpenseAction(
  expenseId: string,
  _previousState: ExpenseDeleteState,
  _formData: FormData,
): Promise<ExpenseDeleteState> {
  try {
    await deleteExpense(expenseId);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }

  revalidatePath('/admin/expenses');
  revalidatePath('/admin/shipments');

  return {
    status: 'success',
    message: 'Despesa removida com sucesso.',
  };
}

function extractActionErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel concluir a operacao agora. Tente novamente.';
}
