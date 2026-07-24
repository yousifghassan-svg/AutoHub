'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/components/ui';
import type { LicensePlateProps } from '../domain/types';
import { generatePlateSvg } from '../lib/generate-plate-svg';
import { exportPlatePdf, exportPlatePng } from '../lib/export-plate';

export type { LicensePlateProps };

const sizeClass: Record<'sm' | 'md' | 'lg' | 'fill', string> = {
  sm: 'max-w-[220px]',
  md: 'max-w-[360px]',
  lg: 'max-w-[520px]',
  fill: 'w-full max-w-none',
};

export function LicensePlate({
  governorate,
  code,
  letter,
  number,
  type,
  className,
  size = 'md',
  showExport = false,
  framed = true,
}: LicensePlateProps & {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'fill';
  showExport?: boolean;
  framed?: boolean;
}) {
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const svg = useMemo(
    () => generatePlateSvg({ governorate, code, letter, number, type }),
    [governorate, code, letter, number, type],
  );

  const onExport = async (kind: 'png' | 'pdf') => {
    setExportError(null);
    setBusy(kind);
    const payload: LicensePlateProps = { governorate, code, letter, number, type };
    try {
      if (kind === 'png') await exportPlatePng(payload);
      else await exportPlatePdf(payload);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={cn('license-plate', sizeClass[size], className)}>
      <div
        className={cn(framed ? 'license-plate__frame' : 'license-plate__bare')}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {showExport ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="license-plate__action"
            disabled={busy !== null}
            onClick={() => void onExport('png')}
          >
            {busy === 'png' ? 'Exporting…' : 'Export PNG'}
          </button>
          <button
            type="button"
            className="license-plate__action"
            disabled={busy !== null}
            onClick={() => void onExport('pdf')}
          >
            {busy === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          {exportError ? <span className="text-xs text-error">{exportError}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
