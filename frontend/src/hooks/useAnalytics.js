import { useQuery } from '@tanstack/react-query';
import {
  getAllComplaints,
  getByCategoryAnalytics,
  getDepartmentPerformanceAnalytics,
  getMonthlyTrendAnalytics,
  getSummaryAnalytics
} from '../api/adminApi';

export function useSummaryAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getSummaryAnalytics
  });
}

export function useByCategoryAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'by-category'],
    queryFn: async () => {
      const data = await getByCategoryAnalytics();
      return data.data || data;
    }
  });
}

export function useMonthlyTrendAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'monthly-trend'],
    queryFn: async () => {
      const data = await getMonthlyTrendAnalytics();
      return data.data || data;
    }
  });
}

export function useDepartmentPerfAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'department-perf'],
    queryFn: async () => {
      const data = await getDepartmentPerformanceAnalytics();
      return data.data || data;
    }
  });
}

export function useStatusBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'status-breakdown'],
    queryFn: async () => {
      const statuses = ['open', 'in_progress', 'resolved'];
      const responses = await Promise.all(
        statuses.map((status) =>
          getAllComplaints({
            status,
            page: 1,
            limit: 1
          })
        )
      );

      return statuses.map((status, index) => ({
        status,
        count: responses[index]?.pagination?.total || 0
      }));
    }
  });
}
