import 'server-only';

import { getAdminAccessToken } from '@/lib/auth/session';
import { requestBackendFormData } from '@/lib/http/backend-api';
import type { UploadedProductImage } from '@/types/uploads/upload.types';

async function getRequiredAdminAccessToken() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    throw new Error('Sua sessão administrativa expirou. Entre novamente.');
  }

  return accessToken;
}

export async function uploadProductImage(file: File) {
  const accessToken = await getRequiredAdminAccessToken();
  const formData = new FormData();

  formData.set('file', file);

  return requestBackendFormData<UploadedProductImage>(
    'admin/uploads/product-images',
    {
      method: 'POST',
      accessToken,
      formData,
    },
  );
}
