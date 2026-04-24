import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Category } from '@/types/catalog/catalog.types';

type ListCategoriesOptions = {
  isActive?: boolean;
};

export async function listCategories(options: ListCategoriesOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.isActive !== undefined) {
    searchParams.set('isActive', String(options.isActive));
  }

  const path =
    searchParams.size > 0 ? `categories?${searchParams}` : 'categories';

  return requestBackend<Category[]>(path, {
    method: 'GET',
  });
}
