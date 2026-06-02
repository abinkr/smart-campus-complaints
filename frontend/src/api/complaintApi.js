import axiosInstance from './axiosInstance';

const statusToApi = {
  open: 'OPEN',
  in_progress: 'IN_PROGRESS',
  resolved: 'RESOLVED'
};

const priorityFromApi = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const priorityToApi = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW'
};

const statusFromApi = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved'
};

function unwrapEnvelope(responseBody) {
  return responseBody?.data ?? responseBody;
}

function normalizeComplaint(complaint) {
  if (!complaint) return complaint;
  return {
    ...complaint,
    status: statusFromApi[complaint.status] ?? complaint.status,
    priority: priorityFromApi[complaint.priority] ?? complaint.priority
  };
}

function normalizeParams(params) {
  return Object.fromEntries(
    Object.entries({
      ...params,
      status: statusToApi[params.status] ?? params.status,
      priority: priorityToApi[params.priority] ?? params.priority,
      search: params.search?.trim()
    }).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
}

export async function submitComplaint(formData) {
  const { data } = await axiosInstance.post('/api/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return normalizeComplaint(unwrapEnvelope(data));
}

export async function getMyComplaints(params = {}) {
  const { data } = await axiosInstance.get('/api/complaints/mine', {
    params: normalizeParams(params)
  });
  const complaints = unwrapEnvelope(data) || [];
  return {
    complaints: complaints.map(normalizeComplaint),
    pagination: data.meta
  };
}

export async function getComplaintHistory(params = {}, config = {}) {
  const { data } = await axiosInstance.get('/api/complaints/history', {
    ...config,
    params: normalizeParams(params)
  });
  const complaints = unwrapEnvelope(data) || [];
  return {
    complaints: complaints.map(normalizeComplaint),
    pagination: data.meta
  };
}

export async function getComplaintById(id) {
  const { data } = await axiosInstance.get(`/api/complaints/${id}`);
  return {
    complaint: normalizeComplaint(unwrapEnvelope(data))
  };
}

export async function submitFollowUp(id, message) {
  const { data } = await axiosInstance.post(`/api/complaints/${id}/follow-ups`, {
    message
  });
  return unwrapEnvelope(data);
}
