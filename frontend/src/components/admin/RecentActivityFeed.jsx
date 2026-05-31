// src/components/admin/RecentActivityFeed.jsx
// A feed of the most recent complaints shown on the dashboard.
//
// Shows a list of recent complaints with category, title, priority, status,
// and relative time submitted.
//
// Props:
//   complaints — array of complaint objects
//   isLoading  — boolean — shows skeleton while loading

import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/formatDate';
import PriorityBadge from '../ui/PriorityBadge';
import StatusBadge from '../ui/StatusBadge';

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading recent complaints">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Derives a two-letter category abbreviation.
 * e.g. "Plumbing" -> "PL"
 */
function getCategoryInitials(category) {
  if (!category) return 'NA';
  return category.substring(0, 2).toUpperCase();
}

/**
 * RecentActivityFeed — list of newest complaints for the dashboard.
 *
 * @param {{ complaints: Array, isLoading: boolean }} props
 */
export default function RecentActivityFeed({ complaints = [], isLoading = false }) {
  return (
    <section
      className="flex flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-sm min-h-[340px]"
      aria-label="Recent complaints activity"
    >
      <div className="px-5 pt-5 pb-3 shrink-0 border-b border-[#e5e7eb]">
        <h3 className="text-sm font-semibold text-[#0a1422] leading-tight tracking-tight">
          Recent Activity
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
          Latest complaints needing attention
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <FeedSkeleton />
        ) : complaints.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-5" role="feed">
            {complaints.map((complaint) => (
              <article
                key={complaint.id}
                className="group relative flex gap-4 items-start"
              >
                {/* Category initial avatar */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-bold"
                  aria-hidden="true"
                >
                  {getCategoryInitials(complaint.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {complaint.title}
                    </p>
                    <time
                      dateTime={complaint.createdAt}
                      className="text-[11px] font-medium text-gray-500 shrink-0 mt-0.5"
                    >
                      {formatRelativeTime(complaint.createdAt)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 truncate">
                    {complaint.category} · {complaint.user?.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                </div>

                {/* Hover overlay link to view details */}
                <Link
                  to={`/admin/complaints`}
                  className="absolute inset-0 z-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1422]"
                  aria-label={`View details for ${complaint.title}`}
                >
                  <span className="sr-only">View</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
