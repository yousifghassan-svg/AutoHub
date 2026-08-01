import { clsx } from 'clsx';
import Link from 'next/link';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

export function cn(...parts: Array<string | false | null | undefined>) {
  return clsx(parts);
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition disabled:opacity-50',
        size === 'sm' && 'h-9 px-3 text-xs',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        variant === 'primary' && 'bg-brand text-white hover:bg-brand-pressed',
        variant === 'secondary' &&
          'border border-border bg-surface text-ink hover:bg-surface-muted',
        variant === 'ghost' && 'bg-transparent text-ink hover:bg-surface-muted',
        variant === 'danger' && 'bg-error text-white hover:opacity-90',
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  label,
  className,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <input
        className={cn(
          'h-11 rounded-md border border-border bg-surface px-3 text-ink outline-none ring-brand focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-80',
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-ink-secondary">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: import('react').TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <textarea
        className={cn(
          'min-h-28 rounded-md border border-border bg-surface px-3 py-2 text-ink outline-none ring-brand focus:ring-2',
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <select
        className={cn(
          'h-11 rounded-md border border-border bg-surface px-3 text-ink outline-none ring-brand focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-80',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function RangeField({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  format = (n) => String(n),
}: {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  step?: number;
  format?: (n: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-secondary">{label}</span>
        <span className="text-ink">
          {format(value[0])} – {format(value[1])}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChange([Math.min(next, value[1]), value[1]]);
        }}
        className="w-full accent-brand"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[1]}
        onChange={(e) => {
          const next = Number(e.target.value);
          onChange([value[0], Math.max(next, value[0])]);
        }}
        className="w-full accent-brand"
      />
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'neutral' && 'bg-surface-muted text-ink-secondary',
        tone === 'brand' && 'bg-brand-soft text-brand',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'warning' && 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-5 shadow-card',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      {description ? <p className="max-w-md text-ink-secondary">{description}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-skeleton dark:bg-surface-muted', className)} />;
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lift"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-ink-secondary hover:bg-surface-muted"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn('text-brand hover:underline', className)}>
      {children}
    </Link>
  );
}
