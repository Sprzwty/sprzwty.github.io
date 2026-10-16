import type { ReactNode } from 'react';

interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Optional swatch colour shown before the label. */
  color?: string;
}

/** Row of pill toggles: pass a Set for independent on/off chips, or a single value for one-of-many. */
export function Chips<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: ChipOption<T>[];
  selected: ReadonlySet<T> | T;
  onToggle: (value: T) => void;
}) {
  const isOn = (v: T) => (typeof selected === 'string' ? selected === v : selected.has(v));

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = isOn(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.value)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
            style={{
              background: on ? 'var(--secondary)' : 'transparent',
              color: on ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderColor: on ? 'var(--border)' : 'transparent',
            }}
          >
            {o.color && <span className="size-2 rounded-full" style={{ background: o.color, opacity: on ? 1 : 0.4 }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function toggleInSet<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
