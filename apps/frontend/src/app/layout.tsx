import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import './globals.css';

const headingFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-heading',
});

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: {
    default: 'EloC',
    template: '%s | EloC',
  },
  description:
    'Catálogo virtual EloC de pratas e semijoias com design exclusivo, qualidade premium e atendimento personalizado.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
