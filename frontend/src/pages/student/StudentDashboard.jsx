import { AlertCircle, CheckCircle2, ListChecks } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import ComplaintList from '../../components/complaint/ComplaintList';
import Spinner from '../../components/ui/Spinner';
import { useMyComplaints } from '../../hooks/useComplaints';

function MetricCard({ title, value, icon: Icon, tone }) {
  const toneClass = {
    blue: 'text-blue-700 bg-blue-50',
    amber: 'text-amber-700 bg-amber-50',
    green: 'text-green-700 bg-green-50'
  }[tone];

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className={`rounded-lg p-2 ${toneClass}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
    </section>
  );
}

export default function StudentDashboard() {
  const recentQuery = useMyComplaints({ page: 1, limit: 6 });
  const resolvedQuery = useMyComplaints({ status: 'resolved', page: 1, limit: 1 });

  if (recentQuery.isLoading || resolvedQuery.isLoading) {
    return <Spinner fullPage />;
  }

  const complaints = recentQuery.data?.complaints || [];
  const total = recentQuery.data?.pagination?.total || complaints.length;
  const resolved = resolvedQuery.data?.pagination?.total || 0;
  const pending = total - resolved;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total Complaints" value={total} icon={ListChecks} tone="blue" />
          <MetricCard title="Pending" value={pending} icon={AlertCircle} tone="amber" />
          <MetricCard title="Resolved" value={resolved} icon={CheckCircle2} tone="green" />
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <ComplaintList complaints={complaints} pagination={recentQuery.data?.pagination} isLoading={false} />
        </section>
      </main>
    </div>
  );
}
