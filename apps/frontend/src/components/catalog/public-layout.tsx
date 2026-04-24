import { listCategories } from '@/services/categories/list-categories';

import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';

type PublicLayoutProps = {
  children: React.ReactNode;
};

export async function PublicLayout({ children }: PublicLayoutProps) {
  const categories = await listCategories({ isActive: true });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <PublicHeader categories={categories} />
      {children}
      <PublicFooter categories={categories} />
    </div>
  );
}
