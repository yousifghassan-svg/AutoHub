import { clsx } from 'clsx';
import Link from 'next/link';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function cn(...parts: Array<string | false | null | undefined>) {
  return clsx(parts);
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return (
    <button
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition disabled:opacity-50',
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
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-ink-secondary">{label}</span> : null}
      <input
        className={cn(
          'h-11 rounded-md border border-border bg-surface px-3 text-ink outline-none ring-brand focus:ring-2',
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

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'success' }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'neutral' && 'bg-surface-muted text-ink-secondary',
        tone === 'brand' && 'bg-brand-soft text-brand',
        tone === 'success' && 'bg-success-soft text-success',
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
