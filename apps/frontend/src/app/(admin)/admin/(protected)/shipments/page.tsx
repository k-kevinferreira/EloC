import { ShipmentManagement } from '@/components/admin/operations-management';
import { requireAuthenticatedAdmin } from '@/lib/auth/session';
import { listProducts } from '@/services/products/list-products';
import { listShipments } from '@/services/shipments/admin-shipments';

export default async function AdminShipmentsPage() {
  const [admin, products, shipments] = await Promise.all([
    requireAuthenticatedAdmin(),
    listProducts({
      limit: 100,
    }),
    listShipments(),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Operacao
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Remessas</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          Registre compras de fornecedor, itens recebidos e custos por produto.
        </p>
      </div>

      <ShipmentManagement
        canDelete={admin.role === 'super_admin'}
        products={products}
        shipments={shipments}
      />
    </section>
  );
}
