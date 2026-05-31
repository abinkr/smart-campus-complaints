import { useEffect, useState } from 'react';
import {
  getSummaryAnalytics,
  getByCategoryAnalytics,
  getMonthlyTrendAnalytics,
  getAllComplaints
} from '../../api/adminApi';
import { AlertCircle, CheckCircle2, Clock3, ListChecks } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import MetricCard from '../../components/ui/MetricCard';
import ChartCard from '../../components/ui/ChartCard';
import RecentActivityFeed from '../../components/admin/RecentActivityFeed';

// Standard colors for the pie chart
const PIE_COLORS = {
  Open: '#ef4444',          // red-500
  'In Progress': '#f59e0b', // amber-500
  Resolved: '#10b981'       // emerald-500
};

export default function AdminDashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      getSummaryAnalytics(),
      getByCategoryAnalytics(),
      getMonthlyTrendAnalytics(),
      getAllComplaints({ limit: 5 })
    ])
      .then(([summary, categories, trend, complaintsResult]) => {
        if (!cancelled) {
          setSummaryData(summary);
          setCategoryData(categories || []);
          setTrendData(trend || []);
          setRecent(complaintsResult?.complaints || []);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Failed to load dashboard data:', error);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sum = {
    total: summaryData?.total ?? 0,
    pending: summaryData?.pending ?? 0,
    resolved: summaryData?.resolved ?? 0,
    avgResolutionTime: summaryData?.avgResolutionDays ? `${summaryData.avgResolutionDays} days` : '0 days'
  };

  const catData = categoryData;
  const statData = summaryData?.statusDistribution ? [
    { name: 'Open', value: summaryData.statusDistribution.OPEN || 0 },
    { name: 'In Progress', value: summaryData.statusDistribution.IN_PROGRESS || 0 },
    { name: 'Resolved', value: summaryData.statusDistribution.RESOLVED || 0 }
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a1422] tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor campus complaints, resolution progress, and department workload.
        </p>
      </div>

      {/* KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Complaints"
          value={isLoading ? '...' : sum.total}
          icon={ListChecks}
          tone="blue"
        />
        <MetricCard
          label="Pending Review"
          value={isLoading ? '...' : sum.pending}
          icon={AlertCircle}
          tone="amber"
          change={!isLoading ? "+2 since yesterday" : undefined}
          changeType="negative"
        />
        <MetricCard
          label="Resolved Cases"
          value={isLoading ? '...' : sum.resolved}
          icon={CheckCircle2}
          tone="green"
        />
        <MetricCard
          label="Avg Resolution Time"
          value={isLoading ? '...' : sum.avgResolutionTime}
          icon={Clock3}
          tone="indigo"
          change={!isLoading ? "Faster by 12%" : undefined}
          changeType="positive"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart — Category */}
        <ChartCard
          title="Complaints by Category"
          description="Distribution of issues across campus departments"
          className="lg:col-span-2"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={catData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Donut Chart — Status */}
        <ChartCard
          title="Status Breakdown"
          description="Current resolution stage of all complaints"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Line Chart — Trend */}
        <ChartCard
          title="Monthly Complaint Trend"
          description="New complaints submitted over the last 6 months"
          className="lg:col-span-2"
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0a1422"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0a1422', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <RecentActivityFeed complaints={recent} isLoading={isLoading} />
        </div>
      </div>
      
    </div>
  );
}
