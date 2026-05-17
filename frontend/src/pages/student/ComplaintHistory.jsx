import { useState } from 'react';
import ComplaintList from '../../components/complaint/ComplaintList';
import Navbar from '../../components/layout/Navbar';
import { useMyComplaints } from '../../hooks/useComplaints';

export default function ComplaintHistory() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyComplaints({ status, page, limit: 6 });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Complaint History</h1>
            <p className="mt-1 text-sm text-gray-600">Track status and review previous submissions.</p>
          </div>
          <div className="w-full sm:w-56">
            <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              className="input-base"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <ComplaintList
          complaints={data?.complaints || []}
          pagination={data?.pagination}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}
