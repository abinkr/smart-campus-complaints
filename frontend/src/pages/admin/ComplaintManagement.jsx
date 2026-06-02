import { useEffect, useState, useCallback, useRef } from 'react';
import { getAllComplaints, updateComplaint, exportCSV } from '../../api/adminApi';
import { Download, ListFilter } from 'lucide-react';

import ComplaintFilters from '../../components/admin/ComplaintFilters';
import ComplaintTable from '../../components/admin/ComplaintTable';
import PaginationControls from '../../components/admin/PaginationControls';
import ComplaintDetailPanel from '../../components/admin/ComplaintDetailPanel';

export default function ComplaintManagement() {
  // --- State ---
  const [data, setData] = useState({ complaints: [], totalCount: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state (drives the API fetch)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
    limit: 10
  });

  // Selected complaint for the detail panel
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Debounce timer ref for search input
  const searchDebounceRef = useRef(null);
  
  // --- Fetch Logic ---
  const loadComplaints = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);

    getAllComplaints(filters).then((result) => {
      if (!cancelled) {
        setData({
          complaints: result.complaints,
          totalCount: result.pagination?.total || 0,
          totalPages: result.pagination?.totalPages || 1
        });
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to load complaints:', err);
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [filters]);

  // Debounce fetch when filters change (especially for search)
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      loadComplaints();
    }, 300);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [filters, loadComplaints]);

  // --- Handlers ---
  function handlePageChange(newPage) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  // Row selection handler
  const handleRowClick = useCallback((complaint) => {
    setSelectedComplaint(complaint);
  }, []);

  function closePanel() {
    setSelectedComplaint(null);
  }

  async function handleSaveComplaint(id, changes) {
    await updateComplaint(id, changes);
    // Re-fetch the list to see updated status in the table immediately
    loadComplaints();
    closePanel();
  }

  function handleExportCsv() {
    exportCSV(filters);
  }

  const isFiltered = Boolean(filters.search || filters.status || filters.priority || filters.category);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1422] tracking-tight">Complaint Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search, review, assign, and update student complaints.
          </p>
        </div>
        
        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isLoading || data.complaints.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0a1422] disabled:opacity-50 transition-all cursor-pointer"
        >
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm p-4 relative">
        <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold text-[#0a1422] uppercase tracking-wider mb-2">
          <ListFilter size={14} />
          <span>Filters & Search</span>
        </div>
        <div className="pt-6">
          <ComplaintFilters
            filters={filters}
            setFilters={setFilters}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex flex-col space-y-3 bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden p-4">
        <ComplaintTable
          complaints={data.complaints}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          isFiltered={isFiltered}
        />
        <PaginationControls
          currentPage={filters.page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>

      {/* Slide-over Detail Panel */}
      <ComplaintDetailPanel
        complaint={selectedComplaint}
        onClose={closePanel}
        onSave={handleSaveComplaint}
      />
      
    </div>
  );
}
