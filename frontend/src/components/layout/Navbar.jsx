import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/submit', label: 'Submit' },
  { to: '/history', label: 'History' }
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/complaints', label: 'Complaints' },
  { to: '/admin/analytics', label: 'Analytics' }
];

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Smart Campus</p>
            <h1 className="text-sm font-semibold text-gray-900">Complaint & Analytics</h1>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs capitalize text-gray-500">{user?.role}</p>
          </div>
          <button
            type="button"
            aria-label="Logout"
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            onClick={() => logout()}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
