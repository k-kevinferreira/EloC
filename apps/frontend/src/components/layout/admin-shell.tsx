'use client';

import { useState } from 'react';

import type { SafeAdmin } from '@/types/auth/auth.types';

import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

type AdminShellProps = Readonly<{
  admin: SafeAdmin;
  children: React.ReactNode;
}>;

export function AdminShell({ admin, children }: AdminShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid max-w-[1600px] gap-3 px-3 py-3 lg:grid-cols-[252px_minmax(0,1fr)] lg:gap-5 lg:px-5 lg:py-4">
        <AdminSidebar
          admin={admin}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-col gap-3 lg:gap-5">
          <AdminTopbar
            admin={admin}
            onOpenNavigation={() => setIsMobileSidebarOpen(true)}
          />

          <main className="min-w-0 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,250,242,0.76)] p-4 shadow-[var(--shadow-md)] backdrop-blur sm:p-5 lg:min-h-[calc(100vh-7.25rem)] lg:rounded-[1.75rem] lg:p-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
