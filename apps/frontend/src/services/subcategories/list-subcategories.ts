import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Subcategory } from '@/types/catalog/catalog.types';

type ListSubcategoriesOptions = {
  categoryId?: string;
  isActive?: boolean;
};

export async function listSubcategories(options: ListSubcategoriesOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.categoryId) {
    searchParams.set('categoryId', options.categoryId);
  }

  if (options.isActive !== undefined) {
    searchParams.set('isActive', String(options.isActive));
  }

  const path =
    searchParams.size > 0 ? `subcategories?${searchParams}` : 'subcategories';

  return requestBackend<Subcategory[]>(path, {
    method: 'GET',
  });
}
