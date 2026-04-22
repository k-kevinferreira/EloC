import Link from 'next/link';

import { logoutAdminAction } from '@/lib/auth/actions';
import type { SafeAdmin } from '@/types/auth/auth.types';

const navigation = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    label: 'Categorias',
    href: '/admin/categories',
  },
  {
    label: 'Subcategorias',
    href: '/admin/subcategories',
  },
  {
    label: 'Produtos',
    href: '/admin/products',
  },
  {
    label: 'Entradas',
    href: '/admin/entries',
  },
  {
    label: 'Despesas',
    href: '/admin/expenses',
  },
  {
    label: 'Remessas',
    href: '/admin/shipments',
  },
] as const;

type AdminSidebarProps = {
  admin: SafeAdmin;
};

export function AdminSidebar({ admin }: AdminSidebarProps) {
  return (
    <aside className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-contrast)] p-6 text-white shadow-[var(--shadow-lg)]">
      <div className="flex h-full flex-col">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
              EloC
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Admin</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold">{admin.name}</p>
            <p className="mt-1 text-sm text-white/65">{admin.email}</p>
            <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              {admin.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-white/78 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={logoutAdminAction} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
