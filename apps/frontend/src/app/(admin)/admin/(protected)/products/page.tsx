import { listProducts } from '@/services/products/list-products';
import { formatCurrency } from '@/utils/formatters/currency';

export default async function AdminProductsPage() {
  const products = await listProducts({
    limit: 200,
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Catalogo
        </p>
        <h1 className="text-4xl font-semibold">Produtos</h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          Esta tela ja traz categoria, subcategoria, destaque e status. O foco aqui
          e consolidar o fluxo administrativo de leitura antes da camada de escrita.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-[rgba(15,45,43,0.04)]">
            <tr className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              <th className="px-6 py-4 font-semibold">Produto</th>
              <th className="px-6 py-4 font-semibold">Codigo</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Preco</th>
              <th className="px-6 py-4 font-semibold">Indicadores</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[var(--border)] align-top">
                <td className="px-6 py-4">
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-[var(--muted)]">{product.slug}</p>
                </td>
                <td className="px-6 py-4 text-[var(--muted)]">{product.code}</td>
                <td className="px-6 py-4 text-[var(--muted)]">
                  {product.category.name}
                  {product.subcategory ? ` · ${product.subcategory.name}` : ''}
                </td>
                <td className="px-6 py-4 font-medium text-[var(--warning)]">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
                      }`}
                    >
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    {product.isFeatured ? (
                      <span className="rounded-full bg-[rgba(183,121,31,0.15)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                        Destaque
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
