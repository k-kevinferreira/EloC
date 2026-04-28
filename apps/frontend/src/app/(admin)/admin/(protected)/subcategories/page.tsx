import { SubcategoryManagement } from '@/components/admin/subcategory-management';
import { requireAuthenticatedAdmin } from '@/lib/auth/session';
import { listCategories } from '@/services/categories/list-categories';
import { listSubcategories } from '@/services/subcategories/list-subcategories';

export default async function AdminSubcategoriesPage() {
  const [admin, categories, subcategories] = await Promise.all([
    requireAuthenticatedAdmin(),
    listCategories(),
    listSubcategories(),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Catálogo
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Subcategorias</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          O painel agora também administra a camada intermediária do catálogo,
          conectando categorias pai e subcategorias sem deslocar regra de negócio
          para a interface.
        </p>
      </div>

      <SubcategoryManagement
        categories={categories}
        canDelete={admin.role === 'super_admin'}
        subcategories={subcategories}
      />
    </section>
  );
}
