'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import { createEntry, deleteEntry, updateEntry } from '@/services/entries/admin-entries';
import type { SaleEntryMutationInput } from '@/types/operations/operations.types';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedEntryStatuses = ['paid', 'pending', 'installment'];

export type EntryFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  values: {
    productId: string;
    quantity: string;
    unitPrice: string;
    paymentMethod: string;
    status: string;
    customerName: string;
    notes: string;
    soldAt: string;
  };
};

export type EntryDeleteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createEntryAction(
  _previousState: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const values = {
    productId: String(formData.get('productId') ?? '').trim(),
    quantity: String(formData.get('quantity') ?? '1').trim(),
    unitPrice: String(formData.get('unitPrice') ?? '').trim(),
    paymentMethod: String(formData.get('paymentMethod') ?? '').trim(),
    status: String(formData.get('status') ?? 'paid').trim(),
    customerName: String(formData.get('customerName') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
    soldAt: String(formData.get('soldAt') ?? '').trim(),
  };
  const parsedQuantity = Number(values.quantity);
  const parsedUnitPrice = Number(values.unitPrice.replace(',', '.'));

  if (!isValidEntryValues(values, parsedQuantity, parsedUnitPrice)) {
    return {
      status: 'error',
      message: 'Revise produto, quantidade, valor, forma de pagamento, status e data.',
      values,
    };
  }

  const input: SaleEntryMutationInput = {
    productId: values.productId,
    quantity: parsedQuantity,
    unitPrice: parsedUnitPrice,
    paymentMethod: values.paymentMethod,
    status: values.status,
    customerName: values.customerName || null,
    notes: values.notes || null,
    soldAt: values.soldAt,
  };

  try {
    await createEntry(input);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
      values,
    };
  }

  revalidatePath('/admin/entries');
  revalidatePath('/admin/products');

  return {
    status: 'success',
    message: 'Entrada registrada com sucesso.',
    values: {
      productId: '',
      quantity: '1',
      unitPrice: '',
      paymentMethod: 'pix',
      status: 'paid',
      customerName: '',
      notes: '',
      soldAt: new Date().toISOString().slice(0, 16),
    },
  };
}

export async function updateEntryAction(
  entryId: string,
  _previousState: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const values = {
    productId: String(formData.get('productId') ?? '').trim(),
    quantity: String(formData.get('quantity') ?? '1').trim(),
    unitPrice: String(formData.get('unitPrice') ?? '').trim(),
    paymentMethod: String(formData.get('paymentMethod') ?? '').trim(),
    status: String(formData.get('status') ?? 'paid').trim(),
    customerName: String(formData.get('customerName') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
    soldAt: String(formData.get('soldAt') ?? '').trim(),
  };
  const parsedQuantity = Number(values.quantity);
  const parsedUnitPrice = Number(values.unitPrice.replace(',', '.'));

  if (!isValidEntryValues(values, parsedQuantity, parsedUnitPrice)) {
    return {
      status: 'error',
      message: 'Revise produto, quantidade, valor, forma de pagamento, status e data.',
      values,
    };
  }

  try {
    await updateEntry(entryId, {
      productId: values.productId,
      quantity: parsedQuantity,
      unitPrice: parsedUnitPrice,
      paymentMethod: values.paymentMethod,
      status: values.status,
      customerName: values.customerName || null,
      notes: values.notes || null,
      soldAt: values.soldAt,
    });
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
      values,
    };
  }

  revalidatePath('/admin/entries');
  revalidatePath('/admin/dashboard');

  return {
    status: 'success',
    message: 'Entrada atualizada com sucesso.',
    values,
  };
}

export async function deleteEntryAction(
  entryId: string,
  _previousState: EntryDeleteState,
  _formData: FormData,
): Promise<EntryDeleteState> {
  try {
    await deleteEntry(entryId);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }

  revalidatePath('/admin/entries');

  return {
    status: 'success',
    message: 'Entrada removida com sucesso.',
  };
}

function isValidEntryValues(
  values: EntryFormState['values'],
  parsedQuantity: number,
  parsedUnitPrice: number,
) {
  return (
    uuidPattern.test(values.productId) &&
    Number.isInteger(parsedQuantity) &&
    parsedQuantity >= 1 &&
    Number.isFinite(parsedUnitPrice) &&
    parsedUnitPrice >= 0 &&
    values.paymentMethod.length > 0 &&
    allowedEntryStatuses.includes(values.status) &&
    values.soldAt.length > 0
  );
}

function extractActionErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível concluir a operação agora. Tente novamente.';
}
