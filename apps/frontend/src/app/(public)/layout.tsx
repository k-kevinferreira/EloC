import { PublicLayout } from '@/components/catalog/public-layout';

type PublicRootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function PublicRootLayout({ children }: PublicRootLayoutProps) {
  return <PublicLayout>{children}</PublicLayout>;
}
