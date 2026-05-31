// src/components/ui/PriorityBadge.jsx
// Renders a colored priority badge for complaint priorities.
//
// Rules:
//   - Uses static Tailwind class maps — NO dynamic class interpolation.
//   - Badge always includes text (not color-only) for accessibility.
//   - Includes a small indicator dot alongside the label for extra visual clarity.

/**
 * Static class map — defined outside the component so Tailwind JIT
 * scanner can detect all class strings and never recreate on render.
 */
const PRIORITY_STYLES = {
  HIGH: 'bg-red-50 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  LOW: 'bg-green-50 text-green-700 border border-green-200'
};

const PRIORITY_DOT_STYLES = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-green-500'
};

const PRIORITY_LABELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

/**
 * PriorityBadge — a pill-shaped badge representing a complaint's priority level.
 *
 * @param {{ priority: 'HIGH' | 'MEDIUM' | 'LOW', className?: string }} props
 */
export default function PriorityBadge({ priority, className = '' }) {
  const normalizedPriority = String(priority || '').toUpperCase();
  const styleClass =
    PRIORITY_STYLES[normalizedPriority] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  const dotClass = PRIORITY_DOT_STYLES[normalizedPriority] ?? 'bg-gray-400';
  const label = PRIORITY_LABELS[normalizedPriority] ?? priority ?? 'Unknown';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styleClass} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClass} shrink-0`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
