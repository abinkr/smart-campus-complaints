// src/components/ui/ChartCard.jsx
// Wrapper card component for any Recharts chart.
//
// Responsibilities:
//   - Provides stable card chrome (border, shadow, rounded, title, description).
//   - Enforces min-h-[340px] so the card never collapses to 0px,
//     preventing the ResizeObserver loop limit exceeded warning.
//   - Does NOT define chart height — each consuming component wraps its
//     Recharts chart in <ResponsiveContainer width="100%" height={260}>,
//     which is the stable, explicit height source.
//   - Children are rendered inside a stable container div with overflow-hidden
//     so charts never bleed outside the card boundary on mobile.

/**
 * ChartCard — a card wrapper for Recharts chart components.
 *
 * @param {Object} props
 * @param {string}  props.title        — Section title rendered as an <h3>
 * @param {string}  [props.description] — Short subtitle / accessibility description
 * @param {React.ReactNode} props.children — Recharts component (must include ResponsiveContainer)
 * @param {string}  [props.className]  — Additional classes for the root element
 */
export default function ChartCard({ title, description, children, className = '' }) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-sm min-h-[340px] ${className}`}
      aria-label={title}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <h3 className="text-sm font-semibold text-[#0a1422] leading-tight tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Chart area — overflow-hidden prevents bleed on small screens */}
      <div className="flex-1 px-2 pb-4 overflow-hidden">
        {children}
      </div>
    </section>
  );
}
