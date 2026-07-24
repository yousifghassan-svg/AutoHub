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
  size?: 'sm' | 'md';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition disabled:opacity-50',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'sm' && 'h-8 px-3 text-xs',
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
  inputRef,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <input
        id={id}
        ref={inputRef}
        className={cn(
          'h-10 rounded-md border border-border bg-surface px-3 text-ink outline-none ring-brand focus:ring-2',
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <textarea
        id={id}
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
  const id = useId();
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <select
        id={id}
        className={cn(
          'h-10 rounded-md border border-border bg-surface px-3 text-ink outline-none ring-brand focus:ring-2',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error';
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'neutral' && 'bg-surface-muted text-ink-secondary',
        tone === 'brand' && 'bg-brand-soft text-brand',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'warning' && 'bg-warning-soft text-warning',
        tone === 'error' && 'bg-error-soft text-error',
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
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      {description ? <p className="max-w-md text-ink-secondary">{description}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-skeleton', className)} />;
}

export function Card({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface shadow-card', className)}>
      {title ? (
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn(!title && 'p-5', title && 'p-5')}>{children}</div>
    </section>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-border text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-secondary',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-ink', className)}>{children}</td>;
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

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-error">{message}</p>
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
              'pointer-events-auto rounded-md px-4 py-3 text-sm font-medium shadow-lift',
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
            className="absolute inset-0 bg-black/50"
            aria-label="Close dialog"
            onClick={() => close(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lift"
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
                disabled={busy}
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
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-secondary">{description}</p> : null}
      </div>
      {action}
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
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-sm text-ink-secondary">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function statusBadgeTone(status: string): 'neutral' | 'brand' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'ACTIVE':
    case 'RESOLVED':
      return 'success';
    case 'PENDING':
    case 'OPEN':
      return 'warning';
    case 'SOLD':
      return 'brand';
    case 'ARCHIVED':
    case 'REJECTED':
    case 'SUSPENDED':
    case 'DELETED':
      return 'error';
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
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
