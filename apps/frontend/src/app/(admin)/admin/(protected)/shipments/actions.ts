'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import { createShipment, deleteShipment } from '@/services/shipments/admin-shipments';
import type {
  ShipmentItemMutationInput,
  ShipmentMutationInput,
} from '@/types/operations/operations.types';

export type ShipmentFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  values: {
    code: string;
    supplier: string;
    shipmentDate: string;
    notes: string;
    items: ShipmentItemFormValue[];
  };
};

export type ShipmentItemFormValue = {
  productId: string;
  quantity: string;
  unitCost: string;
};

export type ShipmentDeleteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createShipmentAction(
  _previousState: ShipmentFormState,
  formData: FormData,
): Promise<ShipmentFormState> {
  const values = {
    code: String(formData.get('code') ?? '').trim(),
    supplier: String(formData.get('supplier') ?? '').trim(),
    shipmentDate: String(formData.get('shipmentDate') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
    items: parseItems(String(formData.get('items') ?? '[]')),
  };
  const items = normalizeItems(values.items);

  if (!values.code || !values.supplier || !values.shipmentDate || items.length === 0) {
    return {
      status: 'error',
      message: 'Informe codigo, fornecedor, data e ao menos um item valido.',
      values,
    };
  }

  const input: ShipmentMutationInput = {
    code: values.code,
    supplier: values.supplier,
    shipmentDate: values.shipmentDate,
    notes: values.notes || null,
    items,
  };

  try {
    await createShipment(input);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
      values,
    };
  }

  revalidatePath('/admin/shipments');
  revalidatePath('/admin/products');

  return {
    status: 'success',
    message: 'Remessa registrada com sucesso.',
    values: {
      code: '',
      supplier: '',
      shipmentDate: new Date().toISOString().slice(0, 10),
      notes: '',
      items: [createEmptyShipmentItem()],
    },
  };
}

export async function deleteShipmentAction(
  shipmentId: string,
  _previousState: ShipmentDeleteState,
  _formData: FormData,
): Promise<ShipmentDeleteState> {
  try {
    await deleteShipment(shipmentId);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }

  revalidatePath('/admin/shipments');

  return {
    status: 'success',
    message: 'Remessa removida com sucesso.',
  };
}

function parseItems(payload: string): ShipmentItemFormValue[] {
  try {
    const parsed = JSON.parse(payload);

    if (!Array.isArray(parsed)) {
      return [createEmptyShipmentItem()];
    }

    return parsed.map((item) => ({
      productId: String(item?.productId ?? '').trim(),
      quantity: String(item?.quantity ?? '1').trim(),
      unitCost: String(item?.unitCost ?? '').trim(),
    }));
  } catch {
    return [createEmptyShipmentItem()];
  }
}

function normalizeItems(items: ShipmentItemFormValue[]): ShipmentItemMutationInput[] {
  return items
    .map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost.replace(',', '.')),
    }))
    .filter((item) => {
      return (
        item.productId.length > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.unitCost) &&
        item.unitCost >= 0
      );
    });
}

function createEmptyShipmentItem(): ShipmentItemFormValue {
  return {
    productId: '',
    quantity: '1',
    unitCost: '',
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
