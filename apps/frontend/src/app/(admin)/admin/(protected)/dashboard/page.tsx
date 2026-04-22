import { getAdminDashboardOverview } from '@/services/dashboard/get-admin-dashboard-overview';
import { formatCurrency } from '@/utils/formatters/currency';

import { StatCard } from '@/components/admin/stat-card';

export default async function AdminDashboardPage() {
  const overview = await getAdminDashboardOverview();

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Dashboard
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl">Visao geral do catalogo</h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
              Esta primeira entrega do painel usa os contratos existentes do backend
              para dar visibilidade operacional ao catalogo e preparar a entrada dos
              modulos financeiros no mesmo shell administrativo.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Categorias"
          value={overview.totalCategories}
          detail={`${overview.activeCategories} ativas`}
        />
        <StatCard
          label="Subcategorias"
          value={overview.totalSubcategories}
          detail={`${overview.activeSubcategories} ativas`}
        />
        <StatCard
          label="Produtos"
          value={overview.loadedProducts}
          detail={`${overview.featuredProducts} em destaque nas listagens`}
        />
      </section>

      <section className="grid gap-4 lg:gap-6 xl:grid-cols-3">
        <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] lg:rounded-[1.75rem] lg:p-6">
          <h2 className="text-2xl font-semibold">Ultimas categorias</h2>
          <div className="mt-5 space-y-3">
            {overview.categoriesPreview.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{category.name}</p>
                    <p className="break-all text-sm text-[var(--muted)]">{category.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      category.isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
                    }`}
                  >
                    {category.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] lg:rounded-[1.75rem] lg:p-6">
          <h2 className="text-2xl font-semibold">Subcategorias recentes</h2>
          <div className="mt-5 space-y-3">
            {overview.subcategoriesPreview.map((subcategory) => (
              <div
                key={subcategory.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <p className="font-semibold">{subcategory.name}</p>
                <p className="break-words text-sm text-[var(--muted)]">
                  {subcategory.category.name} - {subcategory.slug}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] lg:rounded-[1.75rem] lg:p-6">
          <h2 className="text-2xl font-semibold">Produtos recentes</h2>
          <div className="mt-5 space-y-3">
            {overview.productsPreview.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{product.title}</p>
                    <p className="break-words text-sm text-[var(--muted)]">
                      {product.category.name}
                      {product.subcategory ? ` - ${product.subcategory.name}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--warning)]">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
