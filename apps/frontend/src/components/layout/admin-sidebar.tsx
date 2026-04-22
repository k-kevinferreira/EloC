'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AdminSidebar({
  admin,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[rgba(15,45,43,0.28)] backdrop-blur-sm transition duration-200 lg:hidden ${
          isMobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed inset-y-3 left-3 z-50 w-[min(82vw,300px)] rounded-[1.5rem] border border-[rgba(255,255,255,0.06)] bg-[#102f2d] px-4 py-5 text-white shadow-[0_24px_64px_rgba(15,45,43,0.28)] transition duration-200 lg:sticky lg:top-4 lg:z-auto lg:block lg:w-auto lg:self-start lg:rounded-[1.75rem] lg:px-5 lg:py-6 ${
          isMobileOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-[110%] opacity-0 lg:translate-x-0 lg:opacity-100'
        }`}
      >
        <div className="flex h-full max-h-[calc(100vh-1.5rem)] flex-col lg:max-h-[calc(100vh-2rem)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/58">
                EloC
              </p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-none">Admin</h2>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-lg text-white/72 transition hover:bg-white/10 lg:hidden"
              aria-label="Fechar menu"
            >
              ×
            </button>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-white/6 p-4">
            <p className="text-base font-semibold">{admin.name}</p>
            <p className="mt-1 break-all text-sm text-white/62">{admin.email}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/52">
              {admin.role.replace('_', ' ')}
            </p>
          </div>

          <nav className="mt-6 min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#eef5f2] text-[#102F2D] shadow-[inset_0_0_0_1px_rgba(16,47,45,0.06)]'
                        : 'text-white/74 hover:bg-[#eef5f2] hover:text-[#102F2D] hover:shadow-[inset_0_0_0_1px_rgba(16,47,45,0.06)]'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        isActive
                          ? 'bg-[#0f766e]'
                          : 'bg-white/20 group-hover:bg-[#0f766e]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <form action={logoutAdminAction} className="mt-5 border-t border-white/8 pt-4">
            <button
              type="submit"
              className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
