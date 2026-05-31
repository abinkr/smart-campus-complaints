// src/components/admin/PaginationControls.jsx
// Pagination bar for the complaint management table.
//
// Shows:
//   - "Previous" button (disabled on page 1)
//   - Current page info: "Page X of Y  ·  Z results"
//   - "Next" button (disabled on last page)
//
// Props:
//   currentPage  — 1-indexed current page number
//   totalPages   — total number of pages
//   totalCount   — total number of filtered results (optional, for display)
//   onPageChange — function(newPage: number) called when prev/next is clicked
//   isLoading    — boolean — disables buttons while data is loading

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PaginationControls
 *
 * @param {{
 *   currentPage: number,
 *   totalPages: number,
 *   totalCount?: number,
 *   onPageChange: (page: number) => void,
 *   isLoading?: boolean
 * }} props
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  isLoading = false
}) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const isDisabled = isLoading;

  function handlePrev() {
    if (!isFirst && !isDisabled) {
      onPageChange(currentPage - 1);
    }
  }

  function handleNext() {
    if (!isLast && !isDisabled) {
      onPageChange(currentPage + 1);
    }
  }

  // Don't render at all when there is only one page and no results info to show.
  if (totalPages <= 1 && !totalCount) return null;

  return (
    <nav
      className="flex items-center justify-between gap-4 px-1 py-3"
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={isFirst || isDisabled}
        className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition-all duration-150 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a1422] disabled:pointer-events-none disabled:opacity-40"
        aria-label="Go to previous page"
      >
        <ChevronLeft size={15} aria-hidden="true" />
        <span>Previous</span>
      </button>

      {/* Page info */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Page{' '}
          <span className="font-semibold text-[#0a1422]">{currentPage}</span>
          {' of '}
          <span className="font-semibold text-[#0a1422]">{totalPages}</span>
        </p>
        {totalCount !== undefined && (
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCount} result{totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={isLast || isDisabled}
        className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition-all duration-150 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a1422] disabled:pointer-events-none disabled:opacity-40"
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </nav>
  );
}
