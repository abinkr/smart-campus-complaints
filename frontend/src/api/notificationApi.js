import axiosInstance from './axiosInstance';

function unwrapEnvelope(responseBody) {
  return responseBody?.data ?? responseBody;
}

export async function getMyNotifications(limit = 10) {
  const { data } = await axiosInstance.get('/api/notifications', {
    params: {
      limit
    }
  });
  return unwrapEnvelope(data);
}

export async function markMyNotificationRead(id) {
  const { data } = await axiosInstance.patch(`/api/notifications/${id}/read`);
  return unwrapEnvelope(data);
}

export async function markAllMyNotificationsRead() {
  const { data } = await axiosInstance.patch('/api/notifications/read-all');
  return unwrapEnvelope(data);
}
