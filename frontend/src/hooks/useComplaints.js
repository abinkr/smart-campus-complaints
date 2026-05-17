import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getAllComplaints, updateComplaint } from '../api/adminApi';
import {
  getComplaintById,
  getMyComplaints,
  submitComplaint
} from '../api/complaintApi';

function formatApiError(error) {
  if (!error.response) return 'Unable to connect. Please try again.';
  if (error.response.status === 403) return "You don't have permission to do this";
  return error.response?.data?.message || 'Something went wrong';
}

function ensurePagination(meta, count) {
  if (meta) return meta;
  return {
    page: 1,
    limit: count,
    total: count,
    totalPages: 1
  };
}

export function useMyComplaints({ status = '', page = 1, limit = 8 } = {}) {
  return useQuery({
    queryKey: ['complaints', 'mine', { status, page }],
    refetchInterval: 3000,
    queryFn: async () => {
      const data = await getMyComplaints({ status, page, limit });
      const complaints = data.complaints || [];
      return {
        complaints,
        pagination: ensurePagination(data.pagination, complaints.length)
      };
    }
  });
}

export function useComplaintById(id) {
  return useQuery({
    queryKey: ['complaints', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const data = await getComplaintById(id);
      return data.complaint || data;
    }
  });
}

export function useSubmitComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints', 'mine'] });
    },
    onError: (error) => {
      toast.error(formatApiError(error));
    }
  });
}

export function useAdminComplaints(filters) {
  return useQuery({
    queryKey: ['admin', 'complaints', { filters }],
    refetchInterval: 5000,
    queryFn: async () => {
      const data = await getAllComplaints(filters);
      const complaints = data.complaints || [];
      return {
        complaints,
        pagination: ensurePagination(data.pagination, complaints.length)
      };
    }
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateComplaint(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] });
      toast.info('Status updated');
    },
    onError: (error) => {
      toast.error(formatApiError(error));
    }
  });
}
