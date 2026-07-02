import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExpandToggleLabelProps {
  open: boolean;
  expandLabel: string;
  collapseLabel: string;
  className?: string;
}

/** The "展开全文 / 收起 ⌄" label used inside the top toggle button of a diary entry. */
export function ExpandToggleLabel({ open, expandLabel, collapseLabel, className }: ExpandToggleLabelProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`} style={{ color: 'var(--muted-foreground)' }}>
      {open ? collapseLabel : expandLabel}
      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex">
        <ChevronDown className="size-3" />
      </motion.span>
    </span>
  );
}

interface CollapseFooterProps {
  collapseLabel: string;
  onCollapse: () => void;
  className?: string;
}

/** A second "收起" affordance after the full entry — so reading a long diary essay doesn't
 * require scrolling back to the top just to close it again. Only meaningful while expanded;
 * render conditionally on `open` at the call site. */
export function CollapseFooter({ collapseLabel, onCollapse, className }: CollapseFooterProps) {
  return (
    <button
      type="button"
      onClick={onCollapse}
      className={`flex items-center gap-1 text-xs mt-6 pt-4 border-t cursor-pointer ${className ?? ''}`}
      style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
    >
      {collapseLabel}
      <ChevronDown className="size-3 rotate-180" />
    </button>
  );
}
