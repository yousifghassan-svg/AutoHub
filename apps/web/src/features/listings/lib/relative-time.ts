/** Friendly relative timestamp for manage dashboards. */
export function formatRelativeUpdated(
  iso: string | null | undefined,
  nowMs: number = Date.now(),
): string {
  if (!iso) return 'Updated recently';
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return 'Updated recently';

  const diffSec = Math.round((nowMs - then) / 1000);
  if (diffSec < 45) return 'Updated just now';
  if (diffSec < 3600) {
    const mins = Math.max(1, Math.round(diffSec / 60));
    return `Updated ${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.max(1, Math.round(diffSec / 3600));
    return `Updated ${hours}h ago`;
  }
  if (diffSec < 86400 * 7) {
    const days = Math.max(1, Math.round(diffSec / 86400));
    return `Updated ${days}d ago`;
  }
  return `Updated ${new Date(then).toLocaleDateString()}`;
}
