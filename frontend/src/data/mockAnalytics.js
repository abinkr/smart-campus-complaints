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

// Data for Table — Department Performance Metrics
export const departmentPerformanceData = [
  { department: 'Maintenance', totalComplaints: 28, resolved: 22, avgResolutionDays: 2.1 },
  { department: 'IT Support', totalComplaints: 45, resolved: 41, avgResolutionDays: 1.5 },
  { department: 'Electrical', totalComplaints: 18, resolved: 14, avgResolutionDays: 3.2 },
  { department: 'Plumbing', totalComplaints: 25, resolved: 20, avgResolutionDays: 2.8 },
  { department: 'Cleaning', totalComplaints: 30, resolved: 28, avgResolutionDays: 0.8 },
  { department: 'Administration', totalComplaints: 12, resolved: 10, avgResolutionDays: 4.5 }
];
