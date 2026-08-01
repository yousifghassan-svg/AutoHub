export type ListingStatMetric = {
  key: string;
  label: string;
  value: number | null | undefined;
};

/**
 * Domain-agnostic stats row. Metrics with null/undefined values are omitted automatically.
 */
export function ListingStats({
  metrics,
  className,
}: {
  metrics: ListingStatMetric[];
  className?: string;
}) {
  const visible = metrics.filter(
    (m) => m.value != null && Number.isFinite(m.value),
  ) as Array<ListingStatMetric & { value: number }>;

  if (!visible.length) return null;

  return (
    <p className={className ?? 'text-xs text-ink-secondary'}>
      {visible.map((m, i) => (
        <span key={m.key}>
          {i > 0 ? ' · ' : null}
          {m.label} {m.value.toLocaleString()}
        </span>
      ))}
    </p>
  );
}

export function listingStatsFromCounts(input: {
  viewsCount?: number | null;
  favoritesCount?: number | null;
  phoneClicks?: number | null;
  whatsappClicks?: number | null;
}): ListingStatMetric[] {
  return [
    { key: 'views', label: 'Views', value: input.viewsCount },
    { key: 'favorites', label: 'Favorites', value: input.favoritesCount },
    { key: 'phone', label: 'Calls', value: input.phoneClicks },
    { key: 'whatsapp', label: 'WhatsApp', value: input.whatsappClicks },
  ];
}
