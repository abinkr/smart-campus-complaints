// src/components/ui/MetricCard.jsx
// Premium KPI metric card for the admin dashboard.
//
// Design:
//   - White card with subtle border and soft shadow.
//   - Icon housed in a tone-colored rounded square on the right.
//   - Large bold number with a readable label below.
//   - Optional change indicator (positive/negative delta with arrow).
//   - Hover lift animation via Tailwind transition utilities.
//   - rounded-2xl to match the premium design system.

import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Static tone class maps — defined outside the component so Tailwind JIT
 * scanner can detect every class string and they are never recreated on render.
 */
const ICON_BG_STYLES = {
  blue: 'bg-blue-50',
  amber: 'bg-amber-50',
  green: 'bg-green-50',
  indigo: 'bg-indigo-50',
  red: 'bg-red-50'
};

const ICON_COLOR_STYLES = {
  blue: 'text-blue-600',
  amber: 'text-amber-600',
  green: 'text-green-600',
  indigo: 'text-indigo-600',
  red: 'text-red-600'
};

const CHANGE_STYLES = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-500'
};

/**
 * MetricCard — a KPI card component for the admin dashboard.
 *
 * @param {Object} props
 * @param {string}   props.label        — Card label (e.g. "Total Complaints")
 * @param {string|number} props.value   — Main displayed value (e.g. 20 or "2.4 days")
 * @param {React.ComponentType} props.icon — Lucide icon component
 * @param {'blue'|'amber'|'green'|'indigo'|'red'} props.tone — Icon/accent color
 * @param {string} [props.change]       — Optional change text (e.g. "+12% this week")
 * @param {'positive'|'negative'|'neutral'} [props.changeType] — Colors the change text
 * @param {string} [props.id]           — Optional section id for semantic targeting
 */
export default function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  change,
  changeType = 'neutral',
  id
}) {
  const iconBg = ICON_BG_STYLES[tone] ?? 'bg-gray-50';
  const iconColor = ICON_COLOR_STYLES[tone] ?? 'text-gray-600';
  const changeColor = CHANGE_STYLES[changeType] ?? 'text-gray-500';

  return (
    <section
      id={id}
      className="group relative flex flex-col justify-between rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      aria-label={`${label}: ${value}`}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500 leading-tight">{label}</p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
      </div>

      {/* Main value */}
      <div className="mt-3">
        <p className="text-[2rem] font-bold leading-none tracking-tight text-[#0a1422]">
          {value}
        </p>
      </div>

      {/* Optional change indicator */}
      {change && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${changeColor}`}>
          {changeType === 'positive' && (
            <TrendingUp size={13} aria-hidden="true" />
          )}
          {changeType === 'negative' && (
            <TrendingDown size={13} aria-hidden="true" />
          )}
          <span>{change}</span>
        </div>
      )}

      {/* Subtle bottom accent line on hover */}
      <span
        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full ${iconBg} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
        aria-hidden="true"
      />
    </section>
  );
}
