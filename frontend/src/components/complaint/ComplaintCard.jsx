import { useState } from 'react';
import { CalendarDays, FolderKanban, Info } from 'lucide-react';
import Modal from '../ui/Modal';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export default function ComplaintCard({ complaint, onClick }) {
  const [isModalOpen, setModalOpen] = useState(false);

  function openDetails() {
    if (onClick) {
      onClick(complaint);
      return;
    }
    setModalOpen(true);
  }

  return (
    <>
      <article className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">{complaint.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{complaint.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1">
            <FolderKanban size={13} />
            {complaint.category || 'Classifying'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1">
            <CalendarDays size={13} />
            {formatDate(complaint.createdAt)}
          </span>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          onClick={openDetails}
        >
          <Info size={15} />
          View Details
        </button>
      </article>

      {!onClick && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title={`Complaint: ${complaint.title}`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
              <span className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700">
                {complaint.category || 'Classifying'}
              </span>
            </div>
            <p className="text-sm text-gray-700">{complaint.description}</p>
            {complaint.adminNote && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Admin Note</p>
                <p className="mt-1 text-sm text-gray-700">{complaint.adminNote}</p>
              </div>
            )}
            {complaint.imageUrl && (
              <img
                src={complaint.imageUrl}
                alt={`Submitted proof for complaint titled ${complaint.title}`}
                className="w-full rounded-lg border border-gray-200 object-cover"
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
