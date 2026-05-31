// src/layouts/AdminLayout.jsx
// Shell layout that wraps all admin pages.
//
// Rendered once via React Router's <Outlet> mechanism — sidebar and navbar
// are NOT duplicated inside each individual page component.
//
// Owns mobile sidebar state exclusively:
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//
// Layout structure:
//   <root div>                  ← full-height flex column, forced light bg
//     <AdminSidebar />          ← left panel (desktop static / mobile drawer)
//     <div flex-col flex-1>     ← right column: navbar + scrollable main
//       <AdminNavbar />         ← sticky top bar
//       <main>                  ← scrollable page content via <Outlet>
//         <Outlet />
//       </main>
//     </div>
//   </root div>
//
// Dark mode is explicitly neutralised: bg and text colors are hard-coded to
// the design system values so OS/Tailwind dark mode cannot invert the UI.

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import AdminSidebar from '../components/admin/AdminSidebar';

/**
 * AdminLayout — persistent shell for all /admin/* pages.
 * Child pages are rendered inside <Outlet />.
 */
export default function AdminLayout() {
  // Mobile sidebar open state — owned here, passed as props to children.
  // Desktop sidebar is always visible via CSS — this state has no effect on lg+.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function openMobileMenu() {
    setIsMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    // Root: horizontal flex, full viewport height, forced light theme.
    // colorScheme: 'light' prevents browser/OS from applying dark mode overrides.
    <div
      className="flex h-screen overflow-hidden bg-[#f8f9fa] text-[#191c1d]"
      style={{ colorScheme: 'light' }}
    >
      {/* Left: sidebar (desktop persistent / mobile drawer) */}
      <AdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* Right column: navbar stacked above scrollable main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top sticky navbar */}
        <AdminNavbar onMenuOpen={openMobileMenu} />

        {/* Scrollable page content area */}
        <main
          className="flex-1 overflow-y-auto"
          id="admin-main-content"
          tabIndex={-1}
          aria-label="Main content"
        >
          {/* Outlet renders the matched child route (AdminDashboard or ComplaintManagement) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
