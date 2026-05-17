import { AlertCircle, CheckCircle2, Clock3, ListChecks } from 'lucide-react';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import StatusPieChart from '../../components/charts/StatusPieChart';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Spinner from '../../components/ui/Spinner';
import {
  useByCategoryAnalytics,
  useStatusBreakdown,
  useSummaryAnalytics
} from '../../hooks/useAnalytics';

function MetricCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
    indigo: 'bg-indigo-50 text-indigo-700'
  };

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
    </section>
  );
}

export default function AdminDashboard() {
  const summaryQuery = useSummaryAnalytics();
  const categoryQuery = useByCategoryAnalytics();
  const statusQuery = useStatusBreakdown();

  if (summaryQuery.isLoading || categoryQuery.isLoading || statusQuery.isLoading) {
    return <Spinner fullPage />;
  }

  const summary = summaryQuery.data || {};
  const categoryData = categoryQuery.data || [];
  const statusData = statusQuery.data || [];

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Campus complaint overview and current workload.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Complaints" value={summary.total || 0} icon={ListChecks} tone="blue" />
            <MetricCard label="Pending" value={summary.pending || 0} icon={AlertCircle} tone="amber" />
            <MetricCard label="Resolved" value={summary.resolved || 0} icon={CheckCircle2} tone="green" />
            <MetricCard
              label="Avg Resolution Time"
              value={`${summary.averageResolutionHours || 0}h`}
              icon={Clock3}
              tone="indigo"
            />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <CategoryBarChart data={categoryData} />
            <StatusPieChart data={statusData} />
          </div>
        </main>
      </div>
    </div>
  );
}
