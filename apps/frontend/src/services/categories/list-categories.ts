import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Category } from '@/types/catalog/catalog.types';

export async function listCategories() {
  return requestBackend<Category[]>('categories', {
    method: 'GET',
  });
}
