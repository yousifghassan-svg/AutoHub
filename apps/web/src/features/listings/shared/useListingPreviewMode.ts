'use client';

import { useCallback, useState } from 'react';

/**
 * Full Preview Mode for owners: when enabled, the page must render visitor chrome only
 * (no owner actions). Exit via banner control.
 */
export function useListingPreviewMode() {
  const [previewAsVisitor, setPreviewAsVisitor] = useState(false);

  const enterPreview = useCallback(() => setPreviewAsVisitor(true), []);
  const exitPreview = useCallback(() => setPreviewAsVisitor(false), []);

  return { previewAsVisitor, enterPreview, exitPreview };
}
