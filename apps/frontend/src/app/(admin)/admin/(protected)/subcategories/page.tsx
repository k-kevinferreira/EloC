import { listSubcategories } from '@/services/subcategories/list-subcategories';

export default async function AdminSubcategoriesPage() {
  const subcategories = await listSubcategories();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Catalogo
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Subcategorias</h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          A listagem ja mostra a relacao estrutural com categorias, respeitando o
          contrato atual da API e preparando o terreno para formularios de escrita.
        </p>
      </div>

      <div className="grid gap-3 md:hidden">
        {subcategories.map((subcategory) => (
          <article
            key={subcategory.id}
            className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-md)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{subcategory.name}</p>
                <p className="text-sm text-[var(--muted)]">{subcategory.category.name}</p>
                <p className="break-all text-sm text-[var(--muted)]">{subcategory.slug}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  subcategory.isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
                }`}
              >
                {subcategory.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] md:block">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[rgba(15,45,43,0.04)]">
            <tr className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Slug</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((subcategory) => (
              <tr key={subcategory.id} className="border-t border-[var(--border)]">
                <td className="px-6 py-4 font-medium">{subcategory.name}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{subcategory.category.name}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{subcategory.slug}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      subcategory.isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
                    }`}
                  >
                    {subcategory.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
