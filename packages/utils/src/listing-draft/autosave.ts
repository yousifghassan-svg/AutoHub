/**
 * Debounced autosave scheduler (browser / RN friendly).
 * Listing-generic — no domain knowledge.
 */
export function createListingDraftAutosave(options: {
  delayMs?: number;
  save: () => void;
}): {
  schedule: () => void;
  flush: () => void;
  cancel: () => void;
} {
  const delayMs = options.delayMs ?? 500;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const flush = () => {
    cancel();
    options.save();
  };

  const schedule = () => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      options.save();
    }, delayMs);
  };

  return { schedule, flush, cancel };
}
