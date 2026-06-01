// src/components/admin/ComplaintTimeline.jsx
// Vertical status history timeline shown inside the complaint detail panel.
//
// Renders log entries newest-first (pre-sorted by fetchMockComplaintLogs).
// Each entry shows:
//   - oldStatus → newStatus transition with StatusBadge components
//   - changedBy admin name
//   - changedAt formatted date/time (native Intl only)
//   - note text if present
//
// Props:
//   logs      — array of history log objects (pre-sorted newest-first)
//   isLoading — boolean — shows skeleton while logs are loading

import StatusBadge from '../ui/StatusBadge';
import { useSystemTimezone } from '../../context/TimezoneContext';
import { formatDateTime } from '../../utils/formatDate';
import { ArrowRight, ClockIcon } from 'lucide-react';

/**
 * Skeleton placeholder shown while logs are loading.
 */
function TimelineSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading history">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-gray-200 animate-pulse mt-1 shrink-0" />
            {i < 2 && <div className="mt-1 w-px flex-1 bg-gray-100" />}
          </div>
          <div className="pb-4 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ComplaintTimeline — vertical history timeline for a complaint.
 *
 * @param {{ logs: Array, isLoading: boolean }} props
 */
export default function ComplaintTimeline({ logs = [], isLoading = false }) {
  const { timezone } = useSystemTimezone();

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mb-3">
          <ClockIcon size={18} className="text-gray-400" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-gray-500">No history yet</p>
        <p className="mt-0.5 text-xs text-gray-400">
          Status changes will appear here once an admin updates this complaint.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0" aria-label="Complaint status history">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;

        return (
          <li key={`${log.changedAt}-${index}`} className="flex gap-3">
            {/* ---- Timeline indicator column ---- */}
            <div className="flex flex-col items-center shrink-0">
              {/* Dot */}
              <span
                className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0a1422] ring-2 ring-white ring-offset-1 shrink-0"
                aria-hidden="true"
              />
              {/* Connecting vertical line (hidden on last item) */}
              {!isLast && (
                <span
                  className="mt-1 w-px flex-1 bg-gray-200 min-h-[24px]"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* ---- Log entry content ---- */}
            <div className={`pb-5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
              {/* Status transition badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={log.oldStatus} />
                <ArrowRight size={12} className="text-gray-400 shrink-0" aria-hidden="true" />
                <StatusBadge status={log.newStatus} />
              </div>

              {/* Admin name + timestamp */}
              <p className="mt-1.5 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{log.admin?.name || log.changedBy || 'System'}</span>
                {' · '}
                <time dateTime={log.changedAt}>
                  {formatDateTime(log.changedAt, timezone)}
                </time>
              </p>

              {/* Optional note */}
              {log.note && (
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  "{log.note}"
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
