// src/components/admin/ComplaintDetailPanel.jsx
// Slide-over panel (desktop) / full-screen modal (mobile) for viewing
// and updating a specific complaint from the admin portal.

import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSystemTimezone } from '../../context/TimezoneContext';
import { useFocusTrap } from '../../utils/useFocusTrap';
import { formatDate } from '../../utils/formatDate';
import { getComplaintById } from '../../api/complaintApi';
import { addInternalNote } from '../../api/adminApi';
import PriorityBadge from '../ui/PriorityBadge';
import StatusBadge from '../ui/StatusBadge';
import ActivityTimeline from '../complaint/ActivityTimeline';

const DEPARTMENTS = [
  'Maintenance',
  'IT Support',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Administration'
];

export default function ComplaintDetailPanel({ complaint, onClose, onSave }) {
  const { timezone } = useSystemTimezone();
  const panelRef = useRef(null);
  const isOpen = complaint !== null;

  // Manage accessibility focus trapping
  useFocusTrap(panelRef, isOpen, onClose);

  // --- Local State ---
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Note Tab selection state: public student update vs private admin-only note.
  const [noteTab, setNoteTab] = useState('public');

  // Editable form state
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Sync local state when a new complaint is selected
  useEffect(() => {
    if (complaint) {
      setEditStatus(complaint.status);
      setEditPriority(complaint.priority);
      setEditDepartment(complaint.department || '');
      setAdminNote(complaint.adminNote || '');
      setInternalNote('');

      // Fetch logs and details
      let cancelled = false;
      setIsLoadingLogs(true);
      getComplaintById(complaint.id).then((res) => {
        if (!cancelled) {
          setLogs(res.complaint?.logs || []);
          setIsLoadingLogs(false);
        }
      }).catch((err) => {
        console.error('Failed to load complaint details:', err);
        if (!cancelled) setIsLoadingLogs(false);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [complaint]);

  const trimmedInternalNote = internalNote.trim();
  const hasComplaintChanges = Boolean(
    complaint &&
      (editStatus !== complaint.status ||
        editDepartment !== (complaint.department || '') ||
        adminNote !== (complaint.adminNote || ''))
  );
  const hasInternalNote = trimmedInternalNote.length > 0;
  const isDirty = Boolean(complaint && (hasComplaintChanges || hasInternalNote));

  async function handleSave(e) {
    e.preventDefault();
    if (!complaint || !isDirty || isSaving) return;

    setIsSaving(true);
    try {
      if (hasInternalNote) {
        await addInternalNote(complaint.id, trimmedInternalNote);
      }

      if (hasComplaintChanges) {
        await onSave(complaint.id, {
          status: editStatus,
          priority: editPriority, // sent but backend ignores it; preserved for interface contract
          department: editDepartment,
          adminNote: adminNote
        });
      } else {
        onClose();
      }
      toast.success('Complaint updated successfully.');
    } catch (error) {
      console.error('Failed to save complaint', error);
      toast.error('We could not complete this action. Please try again.');
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  // Format AI confidence percentage
  const confidencePercent = complaint.nlpConfidence
    ? `${(Number(complaint.nlpConfidence) * 100).toFixed(0)}%`
    : null;

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
            <h2 id="panel-title" className="text-lg font-bold text-gray-900 leading-tight">
              Complaint Review
            </h2>
            <p className="text-xs font-mono text-gray-400 mt-0.5 uppercase tracking-wide">
              ID: {complaint.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a1422]"
            aria-label="Close detail panel"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto bg-surface-container-low/10">
          <div className="px-6 py-6 flex flex-col gap-6">
            
            {/* ---- 1. Primary Status Header Info ---- */}
            <section aria-label="Complaint Summary" className="bg-white rounded-2xl border border-outline-variant/60 p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="text-xs font-bold text-outline px-2.5 py-1 bg-surface-container-low border border-outline-variant/30 rounded-lg capitalize">
                  {complaint.category}
                </span>
                {confidencePercent && (
                  <span className="text-[10px] font-bold text-secondary bg-secondary/5 border border-secondary/10 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 ml-auto">
                    <Sparkles size={11} />
                    AI: {confidencePercent}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Complaint Information
                </span>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {complaint.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-outline-variant/30 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Student Information
                  </span>
                  <span className="font-semibold text-gray-900 block">{complaint.user?.name}</span>
                  <span className="text-gray-500 block">{complaint.user?.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Submission Date
                  </span>
                  <span className="font-semibold text-gray-900 block">
                    {formatDate(complaint.createdAt, timezone)}
                  </span>
                </div>
              </div>
            </section>

            {/* ---- 2. Optional Image Attachment ---- */}
            {complaint.imageUrl && (
              <section aria-label="Attached Image Evidence" className="bg-white rounded-2xl border border-outline-variant/60 p-5 shadow-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  Proof Image
                </span>
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 group cursor-pointer flex justify-center">
                  <img
                    src={complaint.imageUrl}
                    alt="Uploaded proof image for complaint"
                    className="h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </section>
            )}

            {/* ---- 3. Timeline / Logs ---- */}
            <section aria-label="Status History" className="bg-white rounded-2xl border border-outline-variant/60 p-5 shadow-sm space-y-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Action Log Timeline
              </span>
              <ActivityTimeline logs={logs} isLoading={isLoadingLogs} />
            </section>

          </div>
        </div>

        {/* Footer: Admin Triage Action Panel */}
        <div className="shrink-0 border-t border-[#e5e7eb] bg-gray-50 px-6 py-5 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Status Select */}
              <div>
                <label htmlFor="edit-status" className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Update Status
                </label>
                <select
                  id="edit-status"
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-0 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:outline-none"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="OPEN">Open (Pending)</option>
                  <option value="IN_PROGRESS">In Progress (Review)</option>
                  <option value="RESOLVED">Resolved (Completed)</option>
                </select>
              </div>

              {/* Department Select */}
              <div>
                <label htmlFor="edit-department" className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Assign Department
                </label>
                <select
                  id="edit-department"
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-0 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:outline-none"
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
            </div>

            {/* Note Tab Navigation (Public Reply vs Private note) */}
            <div className="space-y-2">
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setNoteTab('public')}
                  className={`py-1.5 px-4 text-xs font-semibold border-b-2 focus:outline-none transition-colors ${
                    noteTab === 'public'
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Public Update for Student
                </button>
                <button
                  type="button"
                  onClick={() => setNoteTab('internal')}
                  className={`py-1.5 px-4 text-xs font-semibold border-b-2 focus:outline-none transition-colors flex items-center gap-1.5 ${
                    noteTab === 'internal'
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Internal Admin Note
                </button>
              </div>

              {/* Public Update Area */}
              {noteTab === 'public' && (
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold text-secondary uppercase tracking-wide">
                    This message will be visible to the student.
                  </span>
                  <textarea
                    id="edit-note"
                    rows={3}
                    placeholder="Write a message explaining actions taken or resolution instructions..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 focus:outline-none resize-none"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              )}

              {/* Internal Admin Note Area */}
              {noteTab === 'internal' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase tracking-wide">
                    <ShieldAlert size={10} />
                    <span>This note is only visible to admins. Students will not see it.</span>
                  </div>
                  <textarea
                    id="edit-internal-note"
                    rows={3}
                    placeholder="Add private staff details, dispatch IDs, vendor notes, or costs. Saved for admins only."
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/20 p-3 text-sm shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none resize-none"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isDirty || isSaving}
                className="inline-flex items-center justify-center min-w-[130px] rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:bg-gray-400 transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                    Saving Updates...
                  </>
                ) : (
                  'Save Complaint Updates'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
