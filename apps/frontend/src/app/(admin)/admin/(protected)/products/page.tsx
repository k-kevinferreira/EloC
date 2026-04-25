import { ProductManagement } from '@/components/admin/product-management';
import { requireAuthenticatedAdmin } from '@/lib/auth/session';
import { listCategories } from '@/services/categories/list-categories';
import { listProducts } from '@/services/products/list-products';
import { listSubcategories } from '@/services/subcategories/list-subcategories';

export default async function AdminProductsPage() {
  const [admin, categories, subcategories, products] = await Promise.all([
    requireAuthenticatedAdmin(),
    listCategories(),
    listSubcategories(),
    listProducts({
      limit: 100,
    }),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Catalogo
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Produtos</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Cadastre, edite e organize as pecas exibidas no catalogo publico.
        </p>
      </div>

      <ProductManagement
        categories={categories}
        canDelete={admin.role === 'super_admin'}
        products={products}
        subcategories={subcategories}
      />
    </section>
  );
}
