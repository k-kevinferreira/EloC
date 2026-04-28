import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackend } from '@/lib/http/backend-api';
import type {
  Shipment,
  ShipmentMutationInput,
} from '@/types/operations/operations.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function listShipments() {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Shipment[]>('admin/shipments?limit=100', {
    method: 'GET',
    accessToken,
  });
}

export async function createShipment(input: ShipmentMutationInput) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<Shipment>('admin/shipments', {
    method: 'POST',
    accessToken,
    body: input,
  });
}

export async function deleteShipment(id: string) {
  const accessToken = await getRequiredAdminAccessToken();

  return requestBackend<null>(`admin/shipments/${id}`, {
    method: 'DELETE',
    accessToken,
  });
}
