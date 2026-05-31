import axios from 'axios';
import { PORTAL_LOGIN_PATH } from '../portalConfig';

function resolveBaseURL() {
  const configured = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return configured;
  }

  const loopbackHosts = new Set(['localhost', '127.0.0.1']);
  const apiUrl = new URL(configured);

  if (loopbackHosts.has(apiUrl.hostname) && loopbackHosts.has(window.location.hostname)) {
    apiUrl.hostname = window.location.hostname;
    return apiUrl.toString().replace(/\/$/, '');
  }

  return configured;
}

const axiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true
});

let getAccessToken = () => null;
let refreshSession = null;
let logoutSession = null;
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

export function bindAuthHandlers({ tokenGetter, onRefresh, onLogout }) {
  getAccessToken = tokenGetter;
  refreshSession = onRefresh;
  logoutSession = onLogout;
}

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;

    if (!statusCode || statusCode !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (
      originalRequest.skipAuthRefresh ||
      originalRequest._retry ||
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/register')
    ) {
      return Promise.reject(error);
    }

    if (!refreshSession || !logoutSession) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      originalRequest._retry = true;
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshedToken = await refreshSession();
      resolveQueue(null, refreshedToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      await logoutSession({ skipRequest: true });
      if (window.location.pathname !== PORTAL_LOGIN_PATH) {
        window.location.assign(PORTAL_LOGIN_PATH);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
