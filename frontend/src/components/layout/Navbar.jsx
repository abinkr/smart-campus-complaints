import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-surface-container-lowest w-full top-0 border-b border-outline-variant z-50 sticky">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
        {/* Brand */}
        <div className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">assured_workload</span>
          Smart Campus
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-8 h-full">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `h-full flex items-center font-bold pb-1 pt-1 duration-200 ease-in-out hover:text-secondary transition-colors border-b-2 ${
                isActive ? 'text-primary border-secondary' : 'text-on-surface-variant border-transparent'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `h-full flex items-center font-bold pb-1 pt-1 duration-200 ease-in-out hover:text-secondary transition-colors border-b-2 ${
                isActive ? 'text-primary border-secondary' : 'text-on-surface-variant border-transparent'
              }`
            }
          >
            Submit Complaint
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `h-full flex items-center font-bold pb-1 pt-1 duration-200 ease-in-out hover:text-secondary transition-colors border-b-2 ${
                isActive ? 'text-primary border-secondary' : 'text-on-surface-variant border-transparent'
              }`
            }
          >
            History
          </NavLink>
        </div>

        {/* Trailing Icons */}
        <div className="flex items-center space-x-4 text-on-surface-variant">
          <button aria-label="Notifications" className="hover:text-secondary transition-colors duration-200 ease-in-out flex items-center justify-center p-1.5 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-4 pl-2 ml-2 border-l border-outline-variant">
            <span className="text-body-md font-medium text-on-surface-variant hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={() => logout()}
              className="hover:text-error transition-colors duration-200 ease-in-out flex items-center p-1.5 rounded-full hover:bg-surface-container-low"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

