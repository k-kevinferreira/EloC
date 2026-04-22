import 'server-only';

import { listCategories } from '@/services/categories/list-categories';
import { listProducts } from '@/services/products/list-products';
import { listSubcategories } from '@/services/subcategories/list-subcategories';

export async function getAdminDashboardOverview() {
  const [categories, subcategories, products] = await Promise.all([
    listCategories(),
    listSubcategories(),
    listProducts({
      limit: 50,
    }),
  ]);

  return {
    totalCategories: categories.length,
    activeCategories: categories.filter((category) => category.isActive).length,
    totalSubcategories: subcategories.length,
    activeSubcategories: subcategories.filter((subcategory) => subcategory.isActive)
      .length,
    loadedProducts: products.length,
    featuredProducts: products.filter((product) => product.isFeatured).length,
    categoriesPreview: categories.slice(0, 4),
    subcategoriesPreview: subcategories.slice(0, 4),
    productsPreview: products.slice(0, 4),
  };
}
