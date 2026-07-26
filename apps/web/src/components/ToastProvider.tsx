'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from './ui';

type ToastTone = 'info' | 'success' | 'error';

type ToastItem = {
  id: string;
  title: string;
  body?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (input: { title: string; body?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((input: { title: string; body?: string; tone?: ToastTone }) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: ToastItem = {
      id,
      title: input.title,
      body: input.body,
      tone: input.tone ?? 'info',
    };
    setItems((prev) => [...prev.slice(-4), item]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto rounded-lg border px-4 py-3 shadow-lg',
              item.tone === 'success' && 'border-brand/40 bg-surface text-ink',
              item.tone === 'error' && 'border-error/50 bg-surface text-ink',
              item.tone === 'info' && 'border-border bg-surface text-ink',
            )}
          >
            <p className="text-sm font-semibold">{item.title}</p>
            {item.body ? <p className="mt-0.5 text-xs text-ink-secondary">{item.body}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
