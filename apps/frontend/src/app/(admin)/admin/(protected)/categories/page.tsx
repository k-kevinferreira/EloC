import { CategoryManagement } from '@/components/admin/category-management';
import { requireAuthenticatedAdmin } from '@/lib/auth/session';
import { listCategories } from '@/services/categories/list-categories';

export default async function AdminCategoriesPage() {
  const [admin, categories] = await Promise.all([
    requireAuthenticatedAdmin(),
    listCategories(),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Catálogo
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Categorias</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          O painel agora avançou da leitura para a escrita administrativa do módulo
          de categorias. A API continua sendo a camada de verdade para regras de
          negócio, enquanto o frontend orquestra formulário, feedback e sessão.
        </p>
      </div>

      <CategoryManagement
        categories={categories}
        canDelete={admin.role === 'super_admin'}
      />
    </section>
  );
}
