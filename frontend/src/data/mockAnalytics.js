// src/data/mockAnalytics.js
// Static analytics mock data for dashboard charts and metric cards.

export const summaryAnalytics = {
  total: 20,
  pending: 9,
  resolved: 6,
  avgResolutionTime: '2.4 days'
};

// Data for Bar Chart — Complaints by Category
export const categoryData = [
  { category: 'IT', count: 4 },
  { category: 'Maintenance', count: 4 },
  { category: 'Plumbing', count: 3 },
  { category: 'Electrical', count: 3 },
  { category: 'Administration', count: 3 },
  { category: 'Cleaning', count: 2 },
  { category: 'Other', count: 1 }
];

// Data for Donut/Pie Chart — Status Breakdown
export const statusData = [
  { name: 'Open', value: 9 },
  { name: 'In Progress', value: 5 },
  { name: 'Resolved', value: 6 }
];

// Data for Line Chart — Monthly Complaint Trend (last 6 months)
export const monthlyTrendData = [
  { month: 'Dec', count: 5 },
  { month: 'Jan', count: 8 },
  { month: 'Feb', count: 11 },
  { month: 'Mar', count: 7 },
  { month: 'Apr', count: 14 },
  { month: 'May', count: 20 }
];
