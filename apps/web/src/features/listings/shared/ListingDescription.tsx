import { Card } from '@/components/ui';

export function ListingDescription({
  description,
  title = 'Description',
}: {
  description: string | null | undefined;
  title?: string;
}) {
  const text = description?.trim() ?? '';
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      {text ? (
        <p className="mt-3 whitespace-pre-wrap text-ink">{text}</p>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center">
          <p className="text-sm font-medium text-ink">No description provided</p>
          <p className="mt-1 text-xs text-ink-secondary">
            The seller has not added more details for this listing yet.
          </p>
        </div>
      )}
    </Card>
  );
}
