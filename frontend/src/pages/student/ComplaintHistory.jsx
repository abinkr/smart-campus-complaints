import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintList from '../../components/complaint/ComplaintList';
import Navbar from '../../components/layout/Navbar';
import Spinner from '../../components/ui/Spinner';
import { useMyComplaints } from '../../hooks/useComplaints';

export default function ComplaintHistory() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useMyComplaints({ status, page, limit: 6 });

  const rawComplaints = data?.complaints || [];

  // Filter complaints locally by search term for instant responsive search
  const filteredComplaints = rawComplaints.filter((complaint) => {
    const term = searchTerm.toLowerCase();
    return (
      complaint.title.toLowerCase().includes(term) ||
      complaint.description.toLowerCase().includes(term) ||
      complaint.id.toLowerCase().includes(term) ||
      (complaint.category && complaint.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-margin-desktop md:py-section-gap">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-margin-desktop">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-2">Complaint History</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Track the status and resolution of your submitted academic and administrative concerns.
            </p>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-primary-container text-on-primary rounded px-6 py-[12px] font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 w-full md:w-auto self-start shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Submit New Complaint
          </button>
        </div>

        {/* Controls: Search & Filters */}
        <div className="bg-surface-container-lowest border rounded-xl p-4 mb-margin-desktop border-outline-variant">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96 flex-shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[44px] pl-10 pr-4 bg-surface rounded border border-surface-variant font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant"
                placeholder="Search by ID, title, or keywords..."
                type="text"
              />
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden lg:block w-[1px] h-8 bg-surface-variant mx-2"></div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-1 lg:pb-0 items-center">
              <span className="font-label-md text-label-md text-outline mr-2 flex-shrink-0 uppercase font-semibold">
                Filter:
              </span>
              <button
                onClick={() => {
                  setStatus('');
                  setPage(1);
                }}
                className={`flex-shrink-0 border rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors cursor-pointer ${
                  status === ''
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface text-on-surface-variant border-surface-variant hover:bg-surface-container-low'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => {
                  setStatus('open');
                  setPage(1);
                }}
                className={`flex-shrink-0 border rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors cursor-pointer ${
                  status === 'open'
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface text-on-surface-variant border-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => {
                  setStatus('in_progress');
                  setPage(1);
                }}
                className={`flex-shrink-0 border rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors cursor-pointer ${
                  status === 'in_progress'
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface text-on-surface-variant border-surface-variant hover:bg-surface-container-low'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => {
                  setStatus('resolved');
                  setPage(1);
                }}
                className={`flex-shrink-0 border rounded-full px-4 py-1.5 font-label-md text-label-md transition-colors cursor-pointer ${
                  status === 'resolved'
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface text-on-surface-variant border-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <ComplaintList
            complaints={filteredComplaints}
            pagination={data?.pagination}
            isLoading={false}
            onPageChange={setPage}
          />
        )}
      </main>
    </div>
  );
}

