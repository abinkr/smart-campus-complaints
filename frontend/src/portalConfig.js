const rawPortal = import.meta.env.VITE_PORTAL || import.meta.env.MODE || 'student';

export const PORTAL_ROLE = rawPortal.toLowerCase() === 'admin' ? 'admin' : 'student';
export const PORTAL_ROLE_LABEL = PORTAL_ROLE === 'admin' ? 'Admin' : 'Student';
export const PORTAL_HOME_PATH = PORTAL_ROLE === 'admin' ? '/admin' : '/dashboard';
export const PORTAL_REGISTER_PATH = '/register';
export const PORTAL_LOGIN_PATH = '/login';

export const roleToApiSegment = (role = PORTAL_ROLE) => (role === 'admin' ? 'admin' : 'student');
