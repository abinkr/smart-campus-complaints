import { useState } from 'react';
import Modal from '../ui/Modal';
import ActivityTimeline from './ActivityTimeline';
import { getComplaintById, submitFollowUp } from '../../api/complaintApi';
import { useSystemTimezone } from '../../context/TimezoneContext';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { Sparkles, MessageSquare, AlertCircle, Calendar, Shield, MapPin, Eye } from 'lucide-react';

const STATUS_EXPLANATIONS = {
  open: "Your concern has been logged and is awaiting administrative triage.",
  in_progress: "Our team is actively investigating the concern and coordinating resolution.",
  resolved: "The concern has been addressed and marked as resolved. You can review the details below."
};

export default function ComplaintCard({ complaint, onClick }) {
  const { timezone } = useSystemTimezone();
  const [isModalOpen, setModalOpen] = useState(false);
  const [detailedComplaint, setDetailedComplaint] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [followUpError, setFollowUpError] = useState('');
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  async function loadDetails() {
    setIsLoadingDetails(true);
    try {
      const res = await getComplaintById(complaint.id);
      setDetailedComplaint(res.complaint);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  async function openDetails() {
    if (onClick) {
      onClick(complaint);
      return;
    }
    setModalOpen(true);
    setFollowUpError('');
    await loadDetails();
  }

  async function handleFollowUpSubmit(event) {
    event.preventDefault();
    const message = followUpMessage.trim();

    if (message.length < 3 || isSendingFollowUp) {
      return;
    }

    setIsSendingFollowUp(true);
    setFollowUpError('');

    try {
      await submitFollowUp(complaint.id, message);
      setFollowUpMessage('');
      await loadDetails();
    } catch (err) {
      console.error('Failed to submit follow-up:', err);
      setFollowUpError(err.response?.data?.message || 'Unable to send follow-up. Please try again.');
    } finally {
      setIsSendingFollowUp(false);
    }
  }

  // Map status to badges
  const statusConfig = {
    open: {
      label: 'Pending',
      bgClass: 'bg-error-container text-on-error-container border border-error-container/30',
      icon: 'hourglass_empty'
    },
    in_progress: {
      label: 'In Review',
      bgClass: 'bg-primary-fixed text-on-primary-fixed-variant border border-primary-fixed-dim/30',
      icon: 'visibility'
    },
    resolved: {
      label: 'Resolved',
      bgClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary-fixed-dim/30',
      icon: 'check_circle'
    }
  }[complaint.status?.toLowerCase()] || {
    label: complaint.status || 'Unknown',
    bgClass: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
    icon: 'info'
  };

  const priorityConfig = {
    high: { label: 'High Priority', bgClass: 'bg-red-50 text-red-700 border-red-200', icon: 'priority_high' },
    medium: { label: 'Medium Priority', bgClass: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'remove' },
    low: { label: 'Low Priority', bgClass: 'bg-green-50 text-green-700 border-green-200', icon: 'low_priority' }
  }[complaint.priority?.toLowerCase()] || null;

  // Format AI classification confidence score
  const confidencePercent = complaint.nlpConfidence
    ? `${(Number(complaint.nlpConfidence) * 100).toFixed(0)}%`
    : null;

  // Determine current active display details (fallback to list details if dynamic fetch hasn't completed)
  const activeDetail = detailedComplaint || complaint;
  const studentFollowUps = activeDetail.studentFollowUps || [];
  const canSendFollowUp = followUpMessage.trim().length >= 3 && !isSendingFollowUp;

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 flex flex-col justify-between hover:border-outline hover:shadow-md transition-all duration-300">
        <div>
          <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`rounded-full px-3 py-1 font-label-md text-label-md flex items-center gap-1.5 font-semibold ${statusConfig.bgClass}`}>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {statusConfig.icon}
                </span>
                {statusConfig.label}
              </div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-mono">
                ID: {complaint.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {priorityConfig && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${priorityConfig.bgClass}`}>
                <span className="material-symbols-outlined text-[13px] font-bold" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {priorityConfig.icon}
                </span>
                <span>{priorityConfig.label}</span>
              </div>
            )}
          </div>

          <h3 className="font-headline-sm text-headline-sm text-primary mb-2 line-clamp-2 font-bold leading-snug">
            {complaint.title}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-3 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/40">
          <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium">
            <div className="flex items-center gap-1.5 text-outline">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span className="capitalize text-primary font-semibold">
                {complaint.category || 'Classifying...'}
              </span>
            </div>
            
            {confidencePercent && (
              <span className="flex items-center gap-1 text-[10px] bg-secondary/5 text-secondary px-2 py-0.5 rounded-full border border-secondary/10 font-bold uppercase tracking-wider">
                <Sparkles size={10} />
                {confidencePercent} Conf
              </span>
            )}
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="font-label-md text-label-md text-outline font-medium">
              {formatDate(complaint.createdAt, timezone)}
            </span>
            <button
              onClick={openDetails}
              className="text-secondary font-label-md text-label-md font-bold flex items-center gap-1 hover:underline cursor-pointer group"
            >
              Details 
              <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {!onClick && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title={`Complaint Tracking Details`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header / ID / Status block */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full px-3 py-1.5 font-label-md text-label-md font-semibold flex items-center gap-1.5 ${statusConfig.bgClass}`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {statusConfig.icon}
                  </span>
                  {statusConfig.label}
                </div>
                <span className="text-xs text-outline font-semibold tracking-wider font-mono">
                  ID: {complaint.id}
                </span>
              </div>
              {priorityConfig && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${priorityConfig.bgClass}`}>
                  {priorityConfig.label}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-primary leading-tight">{complaint.title}</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface-container-low/20 p-4 rounded-xl border border-outline-variant/30">
                {complaint.description}
              </p>
            </div>

            {/* Status Meanings & Explanation */}
            <div className="bg-secondary/5 rounded-xl border border-secondary/15 p-4 flex gap-3 items-start">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">info</span>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide">Status Triage Info</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  {STATUS_EXPLANATIONS[complaint.status?.toLowerCase()] || STATUS_EXPLANATIONS.open}
                </p>
              </div>
            </div>

            {/* Metadata Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface p-4 rounded-xl border border-outline-variant/30">
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-0.5">Category</p>
                <p className="text-xs font-bold text-primary capitalize flex items-center gap-1">
                  {complaint.category || 'Classifying...'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-0.5">Assigned Department</p>
                <p className="text-xs font-bold text-primary capitalize">
                  {complaint.department || 'Awaiting Assignment'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-0.5">Submitted On</p>
                <p className="text-xs font-bold text-primary">{formatDate(complaint.createdAt, timezone)}</p>
              </div>
            </div>

            {/* Image Evidence */}
            {complaint.imageUrl && (
              <div className="space-y-2">
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider flex items-center gap-1">
                  <Eye size={12} />
                  Supporting Evidence Image
                </p>
                <div className="overflow-hidden rounded-xl border border-outline-variant/50 shadow-sm max-h-[300px] flex justify-center bg-surface">
                  <img
                    src={complaint.imageUrl}
                    alt="Lodge evidence"
                    className="object-contain max-h-[300px] w-full"
                  />
                </div>
              </div>
            )}

            {/* AI Classification Confidence (exposed directly to student) */}
            {confidencePercent && (
              <div className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-secondary shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary">NLP AI Triage Prediction</p>
                    <p className="text-[11px] text-on-surface-variant">Classified categories are routed automatically based on statistical model confidence.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-secondary font-mono">{confidencePercent}</span>
                  <span className="block text-[9px] font-semibold text-outline uppercase tracking-wider">Confidence</span>
                </div>
              </div>
            )}

            {/* Resolution Note if available */}
            {complaint.adminNote && (
              <div className="rounded-xl border border-outline-variant/60 bg-tertiary-fixed/5 p-4 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-on-tertiary-fixed-variant flex items-center gap-1">
                  <MessageSquare size={12} />
                  Resolution Response Message
                </p>
                <p className="text-sm text-primary leading-relaxed">{complaint.adminNote}</p>
              </div>
            )}

            {/* Unified Activity Timeline Logs */}
            <div className="space-y-4 pt-2 border-t border-outline-variant/40">
              <p className="text-xs font-bold uppercase tracking-wider text-outline">Resolution Lifecycle Timeline</p>
              <ActivityTimeline logs={activeDetail.logs || []} isLoading={isLoadingDetails} />
            </div>

            {/* Student Follow-Up / Message Replies */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-outline">Student Reply Thread</p>
              </div>

              {studentFollowUps.length > 0 && (
                <div className="space-y-2">
                  {studentFollowUps.map((reply) => (
                    <div key={reply.id} className="rounded-xl border border-outline-variant/50 bg-white p-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-outline font-bold">
                        <span>{reply.student?.name || 'You'}</span>
                        <span>{formatDateTime(reply.createdAt, timezone)}</span>
                      </div>
                      <p className="mt-2 text-sm text-primary leading-relaxed whitespace-pre-wrap break-words">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleFollowUpSubmit}
                className="bg-surface-container-low/40 border border-outline-variant/50 rounded-xl p-4 space-y-3"
              >
                <textarea
                  rows={2}
                  value={followUpMessage}
                  onChange={(event) => setFollowUpMessage(event.target.value)}
                  disabled={isSendingFollowUp}
                  maxLength={2000}
                  placeholder="Need to add more information or ask for a follow-up?"
                  className="w-full bg-white border border-outline-variant/60 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none"
                />
                {followUpError && (
                  <p className="text-xs font-semibold text-red-600">{followUpError}</p>
                )}
                <button
                  type="submit"
                  disabled={!canSendFollowUp}
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendingFollowUp ? 'Sending...' : 'Send Follow-up Message'}
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
