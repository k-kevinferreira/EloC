import type { SafeAdmin } from '@/types/auth/auth.types';

import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

type AdminShellProps = Readonly<{
  admin: SafeAdmin;
  children: React.ReactNode;
}>;

export function AdminShell({ admin, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid min-h-screen max-w-[1700px] gap-6 px-4 py-4 lg:grid-cols-[290px_1fr] lg:px-6">
        <AdminSidebar admin={admin} />
        <div className="flex min-w-0 flex-col gap-6">
          <AdminTopbar admin={admin} />
          <main className="min-w-0 rounded-[2rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-6 shadow-[var(--shadow-lg)] backdrop-blur lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
