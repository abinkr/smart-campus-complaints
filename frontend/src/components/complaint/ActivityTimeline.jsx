import StatusBadge from '../ui/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';
import { useSystemTimezone } from '../../context/TimezoneContext';
import { ArrowRight, Clock, User, CheckCircle2, MessageSquare, AlertCircle, ShieldAlert } from 'lucide-react';

function TimelineSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading history">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-surface-container animate-pulse mt-1 shrink-0" />
            {i < 2 && <div className="mt-1 w-px flex-1 bg-surface-variant animate-pulse" />}
          </div>
          <div className="pb-4 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-surface-container animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-surface-container animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-surface-container animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityTimeline({ logs = [], isLoading = false }) {
  const { timezone } = useSystemTimezone();

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center bg-surface rounded-2xl border border-outline-variant/30 border-dashed p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container mb-3 text-outline">
          <Clock size={20} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-primary">No activity logged yet</p>
        <p className="mt-1 text-xs text-on-surface-variant max-w-[280px]">
          Status changes, assignments, and updates will be logged here in chronological order.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0 text-left" aria-label="Complaint activity timeline">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        const isResolved = log.newStatus === 'RESOLVED';
        const isSubmit = !log.oldStatus && log.newStatus === 'OPEN';
        const isInternal = Boolean(log.isInternal);

        let iconColor = 'text-primary';
        let ringColor = 'ring-outline-variant';
        let bgIcon = 'bg-surface-container';

        if (isInternal) {
          iconColor = 'text-amber-600';
          ringColor = 'ring-amber-200';
          bgIcon = 'bg-amber-50';
        } else if (isResolved) {
          iconColor = 'text-tertiary-fixed-dim';
          ringColor = 'ring-tertiary-fixed-dim/30';
          bgIcon = 'bg-tertiary-fixed/10';
        } else if (isSubmit) {
          iconColor = 'text-secondary';
          ringColor = 'ring-secondary/30';
          bgIcon = 'bg-secondary-fixed/30';
        }

        return (
          <li key={`${log.id || log.changedAt}-${index}`} className="flex gap-4 group">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center shrink-0">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${bgIcon} ${iconColor} ring-4 ${ringColor} transition-transform duration-300 group-hover:scale-105 shrink-0`}
                aria-hidden="true"
              >
                {isInternal ? (
                  <ShieldAlert size={16} />
                ) : isResolved ? (
                  <CheckCircle2 size={16} />
                ) : log.note ? (
                  <MessageSquare size={16} />
                ) : isSubmit ? (
                  <AlertCircle size={16} />
                ) : (
                  <User size={16} />
                )}
              </span>
              {!isLast && (
                <span
                  className="w-0.5 flex-1 bg-surface-variant group-hover:bg-outline-variant transition-colors min-h-[32px] my-1"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Timeline Content */}
            <div className={`pb-6 flex-1 min-w-0 ${isLast ? 'pb-2' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                {isInternal ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Internal note</span>
                  </div>
                ) : log.oldStatus ? (
                  <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-outline-variant/30 shadow-sm">
                    <StatusBadge status={log.oldStatus} />
                    <ArrowRight size={12} className="text-outline shrink-0" aria-hidden="true" />
                    <StatusBadge status={log.newStatus} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wide">Submitted</span>
                    <StatusBadge status={log.newStatus} />
                  </div>
                )}
              </div>

              {/* Timestamp and modifier name */}
              <p className="mt-2 text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="font-semibold text-primary">{log.admin?.name || log.changedBy || 'System'}</span>
                <span aria-hidden="true">-</span>
                <time dateTime={log.changedAt} className="text-[11px] font-medium text-outline">
                  {formatDateTime(log.changedAt, timezone)}
                </time>
              </p>

              {/* Status Update Note Text */}
              {log.note && (
                <div className={`mt-3 relative text-sm text-on-surface transition-colors rounded-xl px-4 py-3 border shadow-sm leading-relaxed max-w-lg ${
                  isInternal
                    ? 'bg-amber-50/40 hover:bg-amber-50 border-amber-200'
                    : 'bg-surface-container-lowest hover:bg-surface border-outline-variant/40'
                }`}>
                  <div className="absolute top-2.5 right-3 text-[10px] uppercase font-bold text-outline tracking-wider flex items-center gap-1">
                    {isInternal ? <ShieldAlert size={10} /> : <MessageSquare size={10} />}
                    {isInternal ? 'Internal Note' : 'Update Message'}
                  </div>
                  <p className="pr-12 text-primary font-medium">{log.note}</p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
