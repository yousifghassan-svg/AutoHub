'use client';

type Option = { code: string; label: string };

type Props = {
  value: string;
  onChange: (code: string) => void;
  options?: Option[];
  label?: string;
  className?: string;
};

const DEFAULT_OPTIONS: Option[] = [
  { code: 'IQD', label: 'IQD — Iraqi Dinar' },
  { code: 'USD', label: 'USD — US Dollar' },
];

export function CurrencySelect({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  label = 'Currency',
  className,
}: Props) {
  return (
    <label className={className ?? 'block text-sm'}>
      <span className="mb-1 block text-[var(--color-muted)]">{label}</span>
      <select
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
