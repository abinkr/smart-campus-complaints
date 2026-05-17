import DepartmentTable from '../../components/charts/DepartmentTable';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Spinner from '../../components/ui/Spinner';
import {
  useDepartmentPerfAnalytics,
  useMonthlyTrendAnalytics
} from '../../hooks/useAnalytics';

function formatMonth(value) {
  if (!value) return '';
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(date);
}

export default function Analytics() {
  const monthlyQuery = useMonthlyTrendAnalytics();
  const departmentQuery = useDepartmentPerfAnalytics();

  if (monthlyQuery.isLoading || departmentQuery.isLoading) {
    return <Spinner fullPage />;
  }

  const monthlyData = (monthlyQuery.data || []).map((item) => ({
    month: formatMonth(item.month),
    count: item.count
  }));

  const departmentData = (departmentQuery.data || []).map((item) => {
    const totalComplaints = (item.pending || 0) + (item.resolved || 0);
    const averageHours = item.averageResolutionHours || 0;
    return {
      department: item.department,
      totalComplaints,
      resolved: item.resolved || 0,
      avgResolutionDays: Number((averageHours / 24).toFixed(2))
    };
  });

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">Trend and department-level performance over time.</p>

          <div className="mt-6">
            <MonthlyTrendChart data={monthlyData} />
          </div>

          <div className="mt-6">
            <DepartmentTable data={departmentData} />
          </div>
        </main>
      </div>
    </div>
  );
}
