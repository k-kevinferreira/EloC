'use client';

import { useState } from 'react';

type ImageWithFallbackProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className = '',
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const shouldShowFallback = !src || failed;

  if (shouldShowFallback) {
    return (
      <div
        className={[
          'flex h-full w-full items-center justify-center bg-[var(--champagne)] text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]',
          className,
        ].join(' ')}
        aria-label={alt}
      >
        EloC
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
