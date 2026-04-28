import Link from 'next/link';
import type { Route } from 'next';

type PublicButtonProps = {
  href: Route;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const variantClassName = {
  primary:
    'border-[var(--rose-bronze)] bg-[var(--rose-bronze)] text-white shadow-[var(--shadow-md)] hover:bg-[var(--rose-bronze-strong)]',
  secondary:
    'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--rose-bronze)] hover:text-[var(--accent-strong)]',
  ghost:
    'border-transparent bg-transparent text-[var(--foreground)] hover:text-[var(--accent-strong)]',
};

const sizeClassName = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export function PublicButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: PublicButtonProps) {
  return (
    <Link
      href={href}
      className={[
        'inline-flex items-center justify-center rounded-md border font-medium uppercase tracking-[0.16em] transition duration-200 focus:outline-none focus:ring-1 focus:ring-[var(--rose-bronze)] focus:ring-offset-2 focus:ring-offset-[var(--background)]',
        variantClassName[variant],
        sizeClassName[size],
        className,
      ].join(' ')}
    >
      {children}
    </Link>
  );
}
