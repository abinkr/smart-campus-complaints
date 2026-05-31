// src/data/mockApi.js
// Simulated async API helpers. All functions return Promises resolved after
// a short delay to mimic real network latency and exercise loading states.
//
// CANCELLATION PATTERN (for consuming components):
//   useEffect(() => {
//     let cancelled = false;
//     fetchMockComplaints(filters).then(data => {
//       if (!cancelled) { setComplaints(data); setIsLoading(false); }
//     });
//     return () => { cancelled = true; };
//   }, [filters]);

import { mockComplaints } from './mockComplaints.js';
import {
  categoryData,
  monthlyTrendData,
  statusData,
  summaryAnalytics
} from './mockAnalytics.js';
import { mockComplaintLogs } from './mockComplaintLogs.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const PAGE_SIZE_DEFAULT = 8;

/**
 * Applies text search across title, description, id, user name, and user email.
 */
function matchesSearch(complaint, search) {
  if (!search || search.trim() === '') return true;
  const q = search.trim().toLowerCase();
  return (
    complaint.title.toLowerCase().includes(q) ||
    complaint.description.toLowerCase().includes(q) ||
    complaint.id.toLowerCase().includes(q) ||
    complaint.user.name.toLowerCase().includes(q) ||
    complaint.user.email.toLowerCase().includes(q)
  );
}

/**
 * Applies all active filters to the complaints array.
 */
function applyFilters(complaints, filters) {
  const { search = '', status = '', priority = '', category = '' } = filters;

  return complaints.filter((c) => {
    if (status && c.status !== status) return false;
    if (priority && c.priority !== priority) return false;
    if (category && c.category !== category) return false;
    if (!matchesSearch(c, search)) return false;
    return true;
  });
}

/**
 * Returns a shallow copy of the complaint array sorted by createdAt descending.
 */
function sortByDate(complaints) {
  return [...complaints].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// ---------------------------------------------------------------------------
// Public async API functions
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated, filtered list of complaints.
 *
 * @param {Object} filters
 * @param {string} [filters.search]
 * @param {string} [filters.status]   'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | ''
 * @param {string} [filters.priority] 'HIGH' | 'MEDIUM' | 'LOW' | ''
 * @param {string} [filters.category]
 * @param {number} [filters.page]     1-indexed, default 1
 * @param {number} [filters.pageSize] default 8
 *
 * @returns {Promise<{ complaints: Array, totalCount: number, totalPages: number, currentPage: number }>}
 */
export function fetchMockComplaints(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = PAGE_SIZE_DEFAULT } = filters;

      const sorted = sortByDate(mockComplaints);
      const filtered = applyFilters(sorted, filters);

      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const startIndex = (safePage - 1) * pageSize;
      const complaints = filtered.slice(startIndex, startIndex + pageSize);

      resolve({
        complaints,
        totalCount,
        totalPages,
        currentPage: safePage
      });
    }, 600);
  });
}

/**
 * Fetch the top N most recently submitted complaints (for the dashboard feed).
 *
 * @param {number} [limit] default 5
 * @returns {Promise<Array>}
 */
export function fetchRecentComplaints(limit = 5) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = sortByDate(mockComplaints);
      resolve(sorted.slice(0, limit));
    }, 500);
  });
}

/**
 * Fetch analytics data for the admin dashboard.
 *
 * @returns {Promise<{ summary: Object, categoryData: Array, statusData: Array, monthlyTrendData: Array }>}
 */
export function fetchMockAnalytics() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: { ...summaryAnalytics },
        categoryData: [...categoryData],
        statusData: [...statusData],
        monthlyTrendData: [...monthlyTrendData]
      });
    }, 500);
  });
}

/**
 * Fetch the history logs for a specific complaint.
 *
 * @param {string} complaintId
 * @returns {Promise<Array>}
 */
export function fetchMockComplaintLogs(complaintId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const logs = mockComplaintLogs[complaintId] || [];
      // Return a copy sorted by changedAt descending (newest first).
      const sorted = [...logs].sort(
        (a, b) => new Date(b.changedAt) - new Date(a.changedAt)
      );
      resolve(sorted);
    }, 400);
  });
}

/**
 * Simulate updating a complaint (status, priority, department, adminNote).
 * Mutates the in-memory mockComplaints array and appends a history log entry
 * when the status changes.
 *
 * @param {string} id
 * @param {{ status?: string, priority?: string, department?: string, adminNote?: string }} changes
 * @returns {Promise<Object>} the updated complaint object
 */
export function updateMockComplaint(id, changes) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockComplaints.findIndex((c) => c.id === id);
      if (index === -1) {
        reject(new Error(`Complaint ${id} not found.`));
        return;
      }

      const existing = mockComplaints[index];
      const oldStatus = existing.status;
      const newStatus = changes.status !== undefined ? changes.status : oldStatus;

      // Apply changes in place.
      mockComplaints[index] = {
        ...existing,
        status: newStatus,
        priority: changes.priority !== undefined ? changes.priority : existing.priority,
        department:
          changes.department !== undefined ? changes.department : existing.department,
        adminNote:
          changes.adminNote !== undefined ? changes.adminNote : existing.adminNote
      };

      // Append a history log if status changed.
      if (newStatus !== oldStatus) {
        if (!mockComplaintLogs[id]) {
          mockComplaintLogs[id] = [];
        }
        mockComplaintLogs[id].push({
          oldStatus,
          newStatus,
          changedBy: 'Admin (You)',
          note: changes.adminNote || '',
          changedAt: new Date().toISOString()
        });
      }

      resolve({ ...mockComplaints[index] });
    }, 700);
  });
}
