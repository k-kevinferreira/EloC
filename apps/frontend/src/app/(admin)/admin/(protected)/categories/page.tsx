import { listCategories } from '@/services/categories/list-categories';

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Catalogo
        </p>
        <h1 className="text-4xl font-semibold">Categorias</h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          Primeira tela administrativa conectada ao backend. Nesta etapa a base do
          painel consolida leitura, navegacao e autenticacao; a camada de escrita
          entra no proximo incremento do frontend.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[rgba(15,45,43,0.04)]">
            <tr className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Slug</th>
              <th className="px-6 py-4 font-semibold">Ordem</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-[var(--border)]">
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{category.slug}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{category.displayOrder}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      category.isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
                    }`}
                  >
                    {category.isActive ? 'Ativa' : 'Inativa'}
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
