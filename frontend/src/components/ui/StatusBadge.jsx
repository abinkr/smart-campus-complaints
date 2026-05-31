// src/components/ui/StatusBadge.jsx
// Renders a colored status badge for complaint statuses.
//
// Rules:
//   - Uses static Tailwind class maps — NO dynamic class interpolation.
//   - Badge always includes text (not color-only) for accessibility.
//   - Text is uppercase and uses tracking-wider for label readability.

/**
 * Static class map — defined outside the component so it is never recreated
 * on each render and so Tailwind's JIT scanner can detect all class strings.
 */
const STATUS_STYLES = {
  OPEN: 'bg-red-50 text-red-700 border border-red-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200',
  RESOLVED: 'bg-green-50 text-green-700 border border-green-200'
};

const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved'
};

/**
 * StatusBadge — a pill-shaped badge representing a complaint's current status.
 *
 * @param {{ status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED', className?: string }} props
 */
export default function StatusBadge({ status, className = '' }) {
  const styleClass = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  const label = STATUS_LABELS[status] ?? status ?? 'Unknown';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styleClass} ${className}`}
    >
      {label}
    </span>
  );
}
