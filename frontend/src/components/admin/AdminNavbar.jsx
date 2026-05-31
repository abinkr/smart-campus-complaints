// src/components/admin/AdminNavbar.jsx
// Top sticky navbar for the admin portal.
//
// Props:
//   onMenuOpen  — called when the hamburger button is clicked (mobile only)
//
// The actual mobile sidebar open state is owned by AdminLayout.
// AdminNavbar only receives the callback — it does not manage sidebar state.

import { Bell, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Derives up to 2 uppercase initials from an email or display name string.
 * e.g. "sarah.thomas@college.edu" → "ST"
 *      "Admin" → "A"
 *
 * @param {string} emailOrName
 * @returns {string}
 */
function getInitials(emailOrName) {
  if (!emailOrName) return 'A';
  const local = emailOrName.split('@')[0];
  const parts = local.split(/[.\-_\s]+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * AdminNavbar — top navigation bar shared across all admin pages.
 *
 * @param {{ onMenuOpen: () => void }} props
 */
export default function AdminNavbar({ onMenuOpen }) {
  const { user, logout } = useAuth();

  const initials = getInitials(user?.name || user?.email || '');
  const displayName = user?.name || user?.email || 'Admin';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center border-b border-[#e5e7eb] bg-white px-4 sm:px-6">
      {/* -------- Left section -------- */}
      <div className="flex items-center gap-3">
        {/* Hamburger — visible on mobile only */}
        <button
          type="button"
          className="flex lg:hidden items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0a1422]"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Brand — shown on mobile where the sidebar brand is hidden */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0a1422]">
            <ShieldCheck size={14} className="text-white" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-[#0a1422]">Smart Campus</span>
        </div>

        {/* Page context label — visible on desktop only */}
        <span className="hidden lg:block text-sm font-semibold text-[#0a1422] tracking-tight">
          Admin Portal
        </span>
      </div>

      {/* -------- Right section -------- */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications bell */}
        <button
          type="button"
          className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0a1422]"
          aria-label="View notifications"
        >
          <Bell size={18} aria-hidden="true" />
        </button>

        {/* Divider */}
        <span className="hidden sm:block h-6 w-px bg-gray-200 mx-1" aria-hidden="true" />

        {/* User avatar + name */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Avatar circle with initials */}
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a1422] text-white text-xs font-bold select-none"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="hidden md:block max-w-[140px] truncate text-sm font-medium text-gray-700">
            {displayName}
          </span>
        </div>

        {/* Divider */}
        <span className="hidden sm:block h-6 w-px bg-gray-200 mx-1" aria-hidden="true" />

        {/* Logout button */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() => logout()}
          aria-label="Log out of admin portal"
        >
          <LogOut size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
