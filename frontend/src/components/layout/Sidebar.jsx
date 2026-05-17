import { BarChart3, ClipboardList, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
];

function linkClass({ isActive }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;
}

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="sticky top-16 p-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                <Icon size={17} aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
