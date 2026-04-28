import { ExpenseManagement } from '@/components/admin/operations-management';
import { requireAuthenticatedAdmin } from '@/lib/auth/session';
import { listExpenses } from '@/services/expenses/admin-expenses';
import { listShipments } from '@/services/shipments/admin-shipments';

export default async function AdminExpensesPage() {
  const [admin, expenses, shipments] = await Promise.all([
    requireAuthenticatedAdmin(),
    listExpenses(),
    listShipments(),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Finanças
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Despesas</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Controle custos operacionais e vincule despesas a remessas quando houver
          relação direta.
        </p>
      </div>

      <ExpenseManagement
        canDelete={admin.role === 'super_admin'}
        expenses={expenses}
        shipments={shipments}
      />
    </section>
  );
}
