import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Subcategory } from '@/types/catalog/catalog.types';

export async function listSubcategories() {
  return requestBackend<Subcategory[]>('subcategories', {
    method: 'GET',
  });
}
