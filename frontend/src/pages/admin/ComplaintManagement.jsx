import { zodResolver } from '@hookform/resolvers/zod';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { exportCSV } from '../../api/adminApi';
import ComplaintList from '../../components/complaint/ComplaintList';
import Modal from '../../components/ui/Modal';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  useAdminComplaints,
  useUpdateComplaint
} from '../../hooks/useComplaints';

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']),
  department: z.string().min(1),
  admin_note: z.string().max(500).optional()
});

function parseApiError(error) {
  if (!error.response) return 'Unable to connect. Please try again.';
  if (error.response.status === 403) return "You don't have permission to do this";
  return error.response?.data?.message || 'Something went wrong';
}

export default function ComplaintManagement() {
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    page: 1,
    limit: 8
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const complaintsQuery = useAdminComplaints(filters);
  const updateMutation = useUpdateComplaint();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: 'open',
      department: '',
      admin_note: ''
    }
  });

  useEffect(() => {
    if (!selectedComplaint) return;
    reset({
      status: selectedComplaint.status,
      department: selectedComplaint.department || '',
      admin_note: selectedComplaint.adminNote || ''
    });
  }, [reset, selectedComplaint]);

  async function onExportCSV() {
    try {
      await exportCSV(filters);
    } catch (error) {
      toast.error(parseApiError(error));
    }
  }

  async function onSubmit(values) {
    if (!selectedComplaint) return;
    await updateMutation.mutateAsync({
      id: selectedComplaint.id,
      payload: values
    });
    setSelectedComplaint(null);
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Complaint Management</h1>
              <p className="mt-1 text-sm text-gray-600">Filter, review, and update complaint status.</p>
            </div>
            <Button type="button" onClick={onExportCSV}>
              <Download size={16} />
              Export CSV
            </Button>
          </div>

          <section className="card mt-6">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label htmlFor="category-filter" className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="input-base"
                  value={filters.category}
                  onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value, page: 1 }))}
                >
                  <option value="">All</option>
                  <option value="Water">Water</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Network">Network</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority-filter" className="mb-1 block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority-filter"
                  className="input-base"
                  value={filters.priority}
                  onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value, page: 1 }))}
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status-filter"
                  className="input-base"
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value, page: 1 }))}
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label htmlFor="limit-filter" className="mb-1 block text-sm font-medium text-gray-700">
                  Per Page
                </label>
                <select
                  id="limit-filter"
                  className="input-base"
                  value={filters.limit}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      page: 1,
                      limit: Number(event.target.value)
                    }))
                  }
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </section>

          <div className="mt-6">
            <ComplaintList
              complaints={complaintsQuery.data?.complaints || []}
              pagination={complaintsQuery.data?.pagination}
              isLoading={complaintsQuery.isLoading}
              onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage }))}
              onComplaintClick={setSelectedComplaint}
            />
          </div>
        </main>
      </div>

      <Modal
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        title="Update Complaint"
      >
        {selectedComplaint && (
          <div>
            <h3 className="text-base font-semibold text-gray-900">{selectedComplaint.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{selectedComplaint.description}</p>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select id="status" className="input-base" {...register('status')}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                {errors.status?.message && <p className="text-xs text-red-600">{errors.status.message}</p>}
              </div>

              <Input
                id="department"
                label="Department"
                placeholder="Electrical"
                error={errors.department?.message}
                {...register('department')}
              />

              <Input
                id="admin_note"
                as="textarea"
                label="Admin Note"
                placeholder="Add action notes for students and teams."
                error={errors.admin_note?.message}
                {...register('admin_note')}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateMutation.isPending}>
                  Update
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
