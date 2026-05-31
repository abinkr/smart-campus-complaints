import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import ComplaintCard from './ComplaintCard';

export default function ComplaintList({
  complaints,
  pagination,
  isLoading,
  onPageChange,
  onComplaintClick
}) {
  if (isLoading) {
    return (
      <div className="card flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!complaints.length) {
    return (
      <EmptyState
        title="No complaints found"
        description="Try adjusting filters or submit a new complaint."
      />
    );
  }

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const showPagination = Boolean(onPageChange) && totalPages > 1;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {complaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} onClick={onComplaintClick} />
        ))}
      </div>

      {showPagination && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={!canGoPrev}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <p className="text-sm font-semibold text-primary">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={!canGoNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
