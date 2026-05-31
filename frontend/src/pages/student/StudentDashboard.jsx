import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ComplaintList from '../../components/complaint/ComplaintList';
import Spinner from '../../components/ui/Spinner';
import { useMyComplaints } from '../../hooks/useComplaints';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const recentQuery = useMyComplaints({ page: 1, limit: 6 });
  const resolvedQuery = useMyComplaints({ status: 'resolved', page: 1, limit: 1 });
  const pendingQuery = useMyComplaints({ status: 'pending', page: 1, limit: 1 });

  if (recentQuery.isLoading || resolvedQuery.isLoading || pendingQuery.isLoading) {
    return <Spinner fullPage />;
  }

  const complaints = recentQuery.data?.complaints || [];
  const total = recentQuery.data?.pagination?.total || complaints.length;
  const resolved = resolvedQuery.data?.pagination?.total || 0;
  const pending = pendingQuery.data?.pagination?.total || 0;

  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-desktop space-y-section-gap">
        {/* Header & Action Area */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">
              Student Portal
            </p>
            <h1 className="font-display-lg text-display-lg text-primary leading-tight">
              Welcome back, Student
            </h1>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-primary-container text-on-primary font-label-md text-label-md rounded px-[24px] py-[12px] flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Submit New Complaint
          </button>
        </header>

        {/* Metric Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Card: Total */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] flex flex-col justify-between h-[140px] hover:shadow-sm transition-shadow duration-300 group">
            <div className="flex justify-between items-start">
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                Total Complaints
              </span>
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">folder_copy</span>
              </div>
            </div>
            <div>
              <h2 className="font-display-lg text-display-lg text-primary leading-none">
                {total}
              </h2>
            </div>
          </div>

          {/* Card: Pending */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] flex flex-col justify-between h-[140px] hover:shadow-sm transition-shadow duration-300 group">
            <div className="flex justify-between items-start">
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                Pending Review
              </span>
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
            </div>
            <div>
              <h2 className="font-display-lg text-display-lg text-primary leading-none">
                {pending}
              </h2>
            </div>
          </div>

          {/* Card: Resolved */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] flex flex-col justify-between h-[140px] hover:shadow-sm transition-shadow duration-300 group">
            <div className="flex justify-between items-start">
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                Resolved Cases
              </span>
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
            </div>
            <div>
              <h2 className="font-display-lg text-display-lg text-primary leading-none">
                {resolved}
              </h2>
            </div>
          </div>
        </section>

        {/* Recent Complaints */}
        <section className="space-y-6">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">Recent Complaints</h2>
          {complaints.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[48px] md:p-[80px] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-container mb-6 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[40px] text-on-surface-variant"
                  style={{ fontVariationSettings: '"wght" 200' }}
                >
                  inbox
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2 font-bold">
                No active complaints
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
                You currently do not have any active or historical complaints in the system. When
                you submit a new case, it will appear here for tracking.
              </p>
              <button
                onClick={() => navigate('/submit')}
                className="bg-transparent border border-outline text-on-surface-variant font-label-md text-label-md rounded px-[24px] py-[12px] hover:bg-surface-container-low transition-colors duration-200 cursor-pointer"
              >
                File a Complaint
              </button>
            </div>
          ) : (
            <ComplaintList complaints={complaints} pagination={recentQuery.data?.pagination} isLoading={false} />
          )}
        </section>
      </main>
    </div>
  );
}

