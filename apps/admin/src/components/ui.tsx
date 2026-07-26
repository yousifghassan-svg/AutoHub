'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ChevronLeft, ChevronRight, ICON_STROKE, Loader2 } from '@/components/icons';

export function cn(...parts: Array<string | false | null | undefined>) {
  return clsx(parts);
}

const fieldClass =
  'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-secondary/70 focus:border-brand/40 focus:ring-2 focus:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-55';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'icon' && 'h-9 w-9 p-0',
        variant === 'primary' && 'bg-brand text-white shadow-sm hover:bg-brand-pressed',
        variant === 'secondary' &&
          'border border-border bg-surface text-ink shadow-sm hover:bg-surface-muted',
        variant === 'ghost' && 'bg-transparent text-ink hover:bg-surface-muted',
        variant === 'danger' && 'bg-error text-white shadow-sm hover:opacity-90',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} strokeWidth={ICON_STROKE} className="animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}

export function Input({
  label,
  className,
  inputRef,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="text-[13px] font-medium text-ink">{label}</span> : null}
      <input
        id={id}
        ref={inputRef}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(fieldClass, error && 'border-error focus:border-error focus:ring-error/25', className)}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-xs font-medium text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-ink-secondary">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextArea({
  label,
  className,
  error,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="text-[13px] font-medium text-ink">{label}</span> : null}
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-secondary/70 focus:border-brand/40 focus:ring-2 focus:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-55',
          error && 'border-error focus:border-error focus:ring-error/25',
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-xs font-medium text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-ink-secondary">{hint}</span>
      ) : null}
    </label>
  );
}

export function Select({
  label,
  className,
  children,
  error,
  hint,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="text-[13px] font-medium text-ink">{label}</span> : null}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(fieldClass, error && 'border-error focus:border-error focus:ring-error/25', className)}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span id={errorId} className="text-xs font-medium text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-ink-secondary">{hint}</span>
      ) : null}
    </label>
  );
}

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        tone === 'neutral' && 'bg-surface-muted text-ink-secondary',
        tone === 'brand' && 'bg-brand-soft text-brand',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'warning' && 'bg-warning-soft text-warning',
        tone === 'error' && 'bg-error-soft text-error',
        tone === 'info' && 'bg-info-soft text-info',
      )}
    >
      {children}
    </span>
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
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-secondary"
        aria-hidden
      >
        <span className="text-lg font-light">∅</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="max-w-md text-sm text-ink-secondary">{description}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-skeleton', className)} aria-hidden />;
}

export function Card({
  children,
  className,
  title,
  description,
  action,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-surface shadow-card',
        className,
      )}
    >
      {title ? (
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold tracking-tight text-ink">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-ink-secondary">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </section>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('admin-table overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-border text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-secondary',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('whitespace-nowrap px-4 py-3.5 text-ink', className)}>{children}</td>;
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
    <Link
      href={href}
      className={cn(
        'font-medium text-brand transition-colors hover:text-brand-pressed hover:underline',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm font-medium text-error">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

type ToastItem = { id: number; message: string; tone: 'success' | 'error' | 'info' };

type ToastContextValue = {
  toast: (message: string, tone?: ToastItem['tone']) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = ++counter.current;
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto animate-fade-in rounded-lg px-4 py-3 text-sm font-medium shadow-lift',
              item.tone === 'success' && 'bg-success text-white',
              item.tone === 'error' && 'bg-error text-white',
              item.tone === 'info' && 'bg-ink text-white',
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

type DialogState = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm?: () => void | Promise<void>;
};

const DialogContext = createContext<{
  confirm: (opts: Omit<DialogState, 'open'>) => Promise<boolean>;
} | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, title: '' });
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = useCallback((opts: Omit<DialogState, 'open'>) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setState({ ...opts, open: true });
    });
  }, []);

  const close = (value: boolean) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(value);
    resolver.current = null;
  };

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      {state.open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={() => close(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="relative z-10 w-full max-w-md animate-fade-in rounded-xl border border-border bg-surface p-6 shadow-lift"
          >
            <h2 id="dialog-title" className="font-display text-lg font-semibold text-ink">
              {state.title}
            </h2>
            {state.description ? (
              <p className="mt-2 text-sm text-ink-secondary">{state.description}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" disabled={busy} onClick={() => close(false)}>
                {state.cancelLabel ?? 'Cancel'}
              </Button>
              <Button
                variant={state.variant === 'danger' ? 'danger' : 'primary'}
                loading={busy}
                onClick={() => {
                  void (async () => {
                    setBusy(true);
                    try {
                      await state.onConfirm?.();
                      close(true);
                    } catch {
                      close(false);
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
              >
                {state.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DialogContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useConfirm must be used within DialogProvider');
  return ctx.confirm;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-1 pt-4">
      <p className="text-sm text-ink-secondary">
        Page <span className="font-medium text-ink">{page}</span> of{' '}
        <span className="font-medium text-ink">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} strokeWidth={ICON_STROKE} aria-hidden />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight size={14} strokeWidth={ICON_STROKE} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/**
 * Status → badge tone.
 * Published/Active → green · Pending → amber · Rejected → red · Draft → blue · Archived → gray
 */
export function statusBadgeTone(status: string): BadgeTone {
  switch (status) {
    case 'ACTIVE':
    case 'RESOLVED':
    case 'PUBLISHED':
      return 'success';
    case 'PENDING':
    case 'OPEN':
    case 'RESERVED':
      return 'warning';
    case 'REJECTED':
    case 'SUSPENDED':
    case 'DELETED':
    case 'FAILED':
      return 'error';
    case 'DRAFT':
      return 'info';
    case 'ARCHIVED':
    case 'SOLD':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatPrice(value: number | null | undefined, currency = 'IQD'): string {
  if (value == null) return '—';
  const code = currency || 'IQD';
  const fraction = code === 'IQD' ? 0 : 2;
  try {
    return new Intl.NumberFormat('en-IQ', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(value);
  } catch {
    return `${code} ${value.toLocaleString()}`;
  }
}
