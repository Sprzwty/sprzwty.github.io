import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CollapsibleSectionProps {
  defaultOpen: boolean;
  /** Header is a render-prop so each view (Impact / Timeline) can keep its own header styling. */
  header: (state: { open: boolean }) => ReactNode;
  children: ReactNode;
}

/**
 * A year group that expands/collapses. The header itself is the toggle button
 * (large hit area, no separate icon-only control) — callers render their own
 * year label + chevron inside `header`, this just owns the open state and the
 * height animation.
 */
export function CollapsibleSection({ defaultOpen, header, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="block w-full text-left cursor-pointer"
      >
        {header({ open })}
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </section>
  );
}
