import { useState } from 'react';
import Modal from '../ui/Modal';

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium'
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

  // Map status to badges
  const statusConfig = {
    OPEN: {
      label: 'Pending',
      bgClass: 'bg-error-container text-on-error-container',
      icon: 'hourglass_empty'
    },
    IN_PROGRESS: {
      label: 'In Review',
      bgClass: 'bg-primary-fixed text-on-primary-fixed-variant',
      icon: 'visibility'
    },
    RESOLVED: {
      label: 'Resolved',
      bgClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      icon: 'check_circle'
    }
  }[complaint.status.toUpperCase()] || {
    label: complaint.status,
    bgClass: 'bg-surface-container-high text-on-surface-variant',
    icon: 'info'
  };

  const priorityConfig = {
    HIGH: { label: 'High Priority', icon: 'priority_high' },
    MEDIUM: { label: 'Medium Priority', icon: 'remove' },
    LOW: { label: 'Low Priority', icon: 'low_priority' }
  }[complaint.priority?.toUpperCase()] || null;

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter flex flex-col justify-between hover:border-outline transition-all duration-300 hover:shadow-sm">
        <div>
          <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`rounded-full px-3 py-1 font-label-md text-label-md flex items-center gap-1.5 ${statusConfig.bgClass}`}>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {statusConfig.icon}
                </span>
                {statusConfig.label}
              </div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                ID: {complaint.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {priorityConfig && (
              <div className="flex items-center gap-1 text-on-error-container bg-error-container/30 px-2 py-1 rounded-sm">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {priorityConfig.icon}
                </span>
                <span className="font-label-sm text-label-sm uppercase">{priorityConfig.label}</span>
              </div>
            )}
          </div>

          <h3 className="font-headline-sm text-headline-sm text-primary mb-2 line-clamp-2 font-bold">
            {complaint.title}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-3">
            {complaint.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-surface-variant">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span className="font-label-md text-label-md capitalize">
              {complaint.category || 'Classifying...'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-label-md text-label-md text-outline">
              {formatDate(complaint.createdAt)}
            </span>
            <button
              onClick={openDetails}
              className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline cursor-pointer"
            >
              Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {!onClick && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title={`Complaint Details`}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full px-3 py-1 font-label-md text-label-md flex items-center gap-1.5 ${statusConfig.bgClass}`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {statusConfig.icon}
                  </span>
                  {statusConfig.label}
                </div>
                <span className="text-xs text-outline uppercase font-mono">
                  ID: {complaint.id}
                </span>
              </div>
              {priorityConfig && (
                <span className="text-xs font-bold uppercase bg-error-container text-on-error-container px-2 py-1 rounded">
                  {priorityConfig.label}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-primary">{complaint.title}</h4>
              <p className="text-sm text-on-surface-variant whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
              <div>
                <p className="text-xs text-outline uppercase font-bold">Category</p>
                <p className="text-sm font-semibold capitalize">{complaint.category || 'Classifying...'}</p>
              </div>
              <div>
                <p className="text-xs text-outline uppercase font-bold">Submitted On</p>
                <p className="text-sm font-semibold">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            {complaint.adminNote && (
              <div className="rounded-xl border border-outline-variant bg-tertiary-fixed/10 p-4 space-y-1">
                <p className="text-xs font-bold uppercase text-on-tertiary-fixed-variant">Responded Note</p>
                <p className="text-sm text-primary">{complaint.adminNote}</p>
              </div>
            )}

            {complaint.imageUrl && (
              <div className="space-y-2">
                <p className="text-xs text-outline uppercase font-bold">Supporting Evidence</p>
                <img
                  src={complaint.imageUrl}
                  alt="Proof attachment"
                  className="w-full rounded-xl border border-outline-variant object-cover max-h-64 shadow-sm"
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

