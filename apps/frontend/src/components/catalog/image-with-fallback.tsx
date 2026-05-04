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
  const displaySrc = src ? resolveDisplayImageSrc(src) : null;

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
      src={displaySrc ?? src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function resolveDisplayImageSrc(src: string) {
  if (src.startsWith('/api/uploads/')) {
    return src;
  }

  if (src.startsWith('/uploads/')) {
    return `/api${src}`;
  }

  try {
    const url = new URL(src);

    if (url.pathname.startsWith('/uploads/')) {
      return `/api${url.pathname}`;
    }
  } catch {
    return src;
  }

  return src;
}
