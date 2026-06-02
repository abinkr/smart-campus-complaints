import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintList from '../../components/complaint/ComplaintList';
import Navbar from '../../components/layout/Navbar';
import { useComplaintHistory } from '../../hooks/useComplaints';

function useDebouncedValue(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [value, delayMs]);

  return debouncedValue;
}

export default function ComplaintHistory() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 400);

  const { data, isLoading, isFetching } = useComplaintHistory({
    status,
    search: debouncedSearch,
    page,
    limit: 6
  });

  const complaints = data?.complaints || [];
  const showHistoryLoading = isLoading || isFetching;

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-margin-desktop md:py-section-gap">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-2 font-bold">Complaint History</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Track real-time status transitions, assigned departments, and resolution updates of your submitted concerns.
            </p>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-primary text-white border border-transparent rounded-xl px-5 py-3 font-semibold text-sm hover:bg-gray-800 hover:shadow-md transition-all flex items-center justify-center gap-2 w-full md:w-auto self-start shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Submit New Complaint
          </button>
        </div>

        {/* Controls: Search & Filters */}
        <div className="bg-surface-container-lowest border rounded-2xl p-4 mb-8 border-outline-variant/60 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96 flex-shrink-0">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full h-[46px] pl-11 pr-4 bg-surface-container-low/50 hover:bg-surface border border-outline-variant/60 rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all placeholder:text-outline/70"
                placeholder="Search by ID, title, category..."
                type="text"
              />
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-1 lg:pb-0 items-center lg:justify-end">
              <span className="font-label-md text-label-md text-outline mr-2 flex-shrink-0 uppercase font-bold tracking-wider">
                Filter status:
              </span>
              <button
                onClick={() => {
                  setStatus('');
                  setPage(1);
                }}
                className={`flex-shrink-0 rounded-xl px-4 py-2 font-label-md text-label-md font-semibold transition-colors cursor-pointer border ${
                  status === ''
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => {
                  setStatus('open');
                  setPage(1);
                }}
                className={`flex-shrink-0 rounded-xl px-4 py-2 font-label-md text-label-md font-semibold transition-colors cursor-pointer border ${
                  status === 'open'
                    ? 'bg-error-container text-on-error-container border-error-container/50 shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => {
                  setStatus('in_progress');
                  setPage(1);
                }}
                className={`flex-shrink-0 rounded-xl px-4 py-2 font-label-md text-label-md font-semibold transition-colors cursor-pointer border ${
                  status === 'in_progress'
                    ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed/50 shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => {
                  setStatus('resolved');
                  setPage(1);
                }}
                className={`flex-shrink-0 rounded-xl px-4 py-2 font-label-md text-label-md font-semibold transition-colors cursor-pointer border ${
                  status === 'resolved'
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed-dim/50 shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/60 hover:bg-surface-container-low'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Grid List */}
        <ComplaintList
          complaints={complaints}
          pagination={data?.pagination}
          isLoading={showHistoryLoading}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}
