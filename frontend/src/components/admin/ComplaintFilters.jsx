// src/components/admin/ComplaintFilters.jsx
// Filter bar for the Complaint Management page.
//
// Includes:
//   - Text search input (debounced by React state in parent, but driven here)
//   - Status dropdown
//   - Priority dropdown
//   - Category dropdown
//   - Clear Filters button
//
// Props:
//   filters    — current filter state object
//   setFilters — state setter function from parent
//   isLoading  — boolean — optionally disables inputs

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'IT',
  'Cleaning',
  'Maintenance',
  'Administration',
  'Other'
];

/**
 * ComplaintFilters
 *
 * @param {{
 *   filters: { search: string, status: string, priority: string, category: string },
 *   setFilters: (updateFn: (prev) => any) => void,
 *   isLoading?: boolean
 * }} props
 */
export default function ComplaintFilters({ filters, setFilters, isLoading = false }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Keep local search in sync if filters.search is cleared externally
  useEffect(() => {
    if (filters.search === '') {
      setLocalSearch('');
    }
  }, [filters.search]);

  // Debounce the search input to update the parent filters state
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== localSearch) {
        setFilters((prev) => ({ ...prev, search: localSearch, page: 1 }));
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch, filters.search, setFilters]);

  const hasActiveFilters =
    filters.search || filters.status || filters.priority || filters.category;

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function handleClear() {
    setLocalSearch('');
    setFilters((prev) => ({
      ...prev,
      search: '',
      status: '',
      priority: '',
      category: '',
      page: 1
    }));
  }

  return (
    <section
      className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
      aria-label="Filter complaints"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* ---- Search Input ---- */}
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="search-complaints" className="sr-only">
            Search complaints, students, locations, or IDs
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={18} aria-hidden="true" />
            </div>
            <input
              type="text"
              id="search-complaints"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422] disabled:opacity-50"
              placeholder="Search complaints, students, locations, or IDs"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* ---- Dropdown Filters Row ---- */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <div className="w-32 shrink-0">
            <label htmlFor="filter-status" className="sr-only">
              Status
            </label>
            <select
              id="filter-status"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm text-gray-700 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422] disabled:opacity-50"
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Priority */}
          <div className="w-32 shrink-0">
            <label htmlFor="filter-priority" className="sr-only">
              Priority
            </label>
            <select
              id="filter-priority"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm text-gray-700 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422] disabled:opacity-50"
              value={filters.priority || ''}
              onChange={(e) => updateFilter('priority', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Category */}
          <div className="w-40 shrink-0">
            <label htmlFor="filter-category" className="sr-only">
              Category
            </label>
            <select
              id="filter-category"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm text-gray-700 shadow-sm focus:border-[#0a1422] focus:outline-none focus:ring-1 focus:ring-[#0a1422] disabled:opacity-50"
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a1422] disabled:opacity-50"
              aria-label="Clear all filters"
            >
              <X size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Clear Filters</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
