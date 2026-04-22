import { requireAuthenticatedAdmin } from '@/lib/auth/session';

import { AdminShell } from '@/components/layout/admin-shell';

type ProtectedAdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const admin = await requireAuthenticatedAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
