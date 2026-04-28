import 'server-only';

import { listCategories } from '@/services/categories/list-categories';
import { listEntries } from '@/services/entries/admin-entries';
import { listExpenses } from '@/services/expenses/admin-expenses';
import { listProducts } from '@/services/products/list-products';
import { listShipments } from '@/services/shipments/admin-shipments';
import { listSubcategories } from '@/services/subcategories/list-subcategories';

export async function getAdminDashboardOverview() {
  const [categories, subcategories, products, entries, expenses, shipments] =
    await Promise.all([
      listCategories(),
      listSubcategories(),
      listProducts({
        limit: 50,
      }),
      listEntries(),
      listExpenses(),
      listShipments(),
    ]);

  return {
    totalCategories: categories.length,
    activeCategories: categories.filter((category) => category.isActive).length,
    totalSubcategories: subcategories.length,
    activeSubcategories: subcategories.filter((subcategory) => subcategory.isActive)
      .length,
    loadedProducts: products.length,
    featuredProducts: products.filter((product) => product.isFeatured).length,
    totalEntries: entries.length,
    totalEntryAmount: entries.reduce(
      (total, entry) => total + Number(entry.totalAmount),
      0,
    ),
    totalExpenses: expenses.length,
    totalExpenseAmount: expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    ),
    totalShipments: shipments.length,
    totalShipmentCost: shipments.reduce(
      (total, shipment) => total + Number(shipment.totalCost),
      0,
    ),
    categoriesPreview: categories.slice(0, 4),
    subcategoriesPreview: subcategories.slice(0, 4),
    productsPreview: products.slice(0, 4),
    entriesPreview: entries.slice(0, 4),
    expensesPreview: expenses.slice(0, 4),
    shipmentsPreview: shipments.slice(0, 4),
  };
}
