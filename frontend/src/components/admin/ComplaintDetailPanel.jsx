// src/components/admin/ComplaintDetailPanel.jsx
// Slide-over panel (desktop) / full-screen modal (mobile) for viewing
// and updating a specific complaint.
//
// Props:
//   complaint — the complaint object to view (if null, panel is closed)
//   onClose   — function called to close the panel
//   onSave    — function(id, changes) called to update the complaint

import { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { formatDate } from '../../utils/formatDate';
import { fetchMockComplaintLogs } from '../../data/mockApi';
import PriorityBadge from '../ui/PriorityBadge';
import StatusBadge from '../ui/StatusBadge';
import ComplaintTimeline from './ComplaintTimeline';

const DEPARTMENTS = [
  'Maintenance',
  'IT Support',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Administration'
];

/**
 * ComplaintDetailPanel
 *
 * @param {{
 *   complaint: Object | null,
 *   onClose: () => void,
 *   onSave: (id: string, payload: Object) => Promise<void>
 * }} props
 */
export default function ComplaintDetailPanel({ complaint, onClose, onSave }) {
  const panelRef = useRef(null);
  const isOpen = complaint !== null;

  // Use the reusable focus trap hook to manage accessibility
  useFocusTrap(panelRef, isOpen, onClose);

  // --- Local State ---
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable form state
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // --- Effects ---
  // Sync local state when a new complaint is selected
  useEffect(() => {
    if (complaint) {
      setEditStatus(complaint.status);
      setEditPriority(complaint.priority);
      setEditDepartment(complaint.department || '');
      setAdminNote(complaint.adminNote || '');

      // Fetch logs
      let cancelled = false;
      setIsLoadingLogs(true);
      fetchMockComplaintLogs(complaint.id).then((fetchedLogs) => {
        if (!cancelled) {
          setLogs(fetchedLogs);
          setIsLoadingLogs(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [complaint]);

  // --- Handlers ---
  const isDirty =
    complaint &&
    (editStatus !== complaint.status ||
      editPriority !== complaint.priority ||
      editDepartment !== (complaint.department || '') ||
      adminNote !== (complaint.adminNote || ''));

  async function handleSave(e) {
    e.preventDefault();
    if (!complaint || !isDirty || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(complaint.id, {
        status: editStatus,
        priority: editPriority,
        department: editDepartment,
        adminNote: adminNote
      });
      // The onSave function in parent will trigger re-fetch and close the panel.
    } catch (error) {
      console.error('Failed to save complaint', error);
      setIsSaving(false); // only reset on error; on success, panel closes
    }
  }

  // --- Render logic ---
  // If closed, return null. But wait for animation? We use simple conditional render here.
  // Tailwind slide-over animations usually require a transition library (Headless UI) or
  // complex state. For this mock, we'll use a direct conditional render with a quick fade-in.
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#0a1422]/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col sm:w-[90vw] md:w-[600px] animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 id="panel-title" className="text-lg font-semibold text-gray-900 leading-tight">
              Complaint Details
            </h2>
            <p className="text-xs font-mono text-gray-500 mt-0.5">
              ID: {complaint.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a1422]"
            aria-label="Close detail panel"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 flex flex-col gap-8">
            
            {/* ---- 1. Primary Info ---- */}
            <section aria-label="Complaint Summary">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md">
                  {complaint.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {complaint.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                    Submitted By
                  </span>
                  <span className="font-medium text-gray-900">{complaint.user?.name}</span>
                  <span className="block text-gray-500">{complaint.user?.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                    Date
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>
              </div>
            </section>

            {/* ---- 2. Optional Image ---- */}
            {complaint.imageUrl && (
              <section aria-label="Attached Image">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Attachment
                </span>
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 group cursor-pointer">
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint attachment"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Note: In a full app, clicking might open a lightbox. We leave it simple here. */}
                </div>
              </section>
            )}

            {/* ---- 3. Timeline ---- */}
            <section aria-label="Status History">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Activity Timeline
              </span>
              <ComplaintTimeline logs={logs} isLoading={isLoadingLogs} />
            </section>

          </div>
        </div>

        {/* Footer: Admin Controls Form */}
        <div className="shrink-0 border-t border-[#e5e7eb] bg-gray-50 px-6 py-5">
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Status Select */}
              <div>
                <label htmlFor="edit-status" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Update Status
                </label>
                <select
                  id="edit-status"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label htmlFor="edit-priority" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Department Select */}
            <div>
              <label htmlFor="edit-department" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Assign Department
              </label>
              <select
                id="edit-department"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422]"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                disabled={isSaving}
              >
                <option value="">Unassigned</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Admin Note Textarea */}
            <div>
              <label htmlFor="edit-note" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Internal Note / Action Taken
              </label>
              <textarea
                id="edit-note"
                rows={3}
                placeholder="Add notes about actions taken or resolutions..."
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422] resize-none"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0a1422] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isDirty || isSaving}
                className="inline-flex items-center justify-center min-w-[120px] rounded-lg bg-[#0a1422] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a1422] focus:ring-offset-2 disabled:opacity-50 disabled:bg-gray-400"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
