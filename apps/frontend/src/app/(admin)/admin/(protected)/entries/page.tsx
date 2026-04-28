import { EntryManagement } from '@/components/admin/operations-management';
import { requireAuthenticatedAdmin } from '@/lib/auth/session';
import { listEntries } from '@/services/entries/admin-entries';
import { listProducts } from '@/services/products/list-products';

export default async function AdminEntriesPage() {
  const [admin, entries, products] = await Promise.all([
    requireAuthenticatedAdmin(),
    listEntries(),
    listProducts({
      limit: 100,
    }),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Financas
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Entradas</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Registre vendas manuais e mantenha o historico financeiro vinculado ao
          catalogo.
        </p>
      </div>

      <EntryManagement
        canDelete={admin.role === 'super_admin'}
        entries={entries}
        products={products}
      />
    </section>
  );
}
