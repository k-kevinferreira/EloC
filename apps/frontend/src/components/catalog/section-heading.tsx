type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  centered?: boolean;
};

export function SectionHeading({
  title,
  subtitle,
  action,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        'mb-10 flex gap-6',
        centered
          ? 'flex-col items-center text-center'
          : 'items-end justify-between',
      ].join(' ')}
    >
      <div className="space-y-4">
        <h2 className="font-heading text-4xl leading-none text-[var(--foreground)] sm:text-5xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm leading-7 tracking-[0.04em] text-[var(--muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
