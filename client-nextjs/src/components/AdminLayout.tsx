import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import mutsynchLogo from '@/assets/images/mutsynchub-logo.png';

const navLinks = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/advanced-analytics', label: 'Advanced Analytics' },
  { to: '/admin/feature-flags', label: 'Feature Flags' },
  { to: '/admin/system-controls', label: 'System Controls' },
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
  { to: '/admin/revenue', label: 'Revenue' },
  { to: '/admin/system-status', label: 'System Status' },
  { to: '/admin/settings', label: 'System Settings' },
  { to: '/admin/support', label: 'Support' },
  { to: '/admin/notifications', label: 'Notifications' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  // Fallback user object to avoid type errors
  const user: { name?: string; email?: string } = {};
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = () => {
    // Redirect to Neon Auth sign-out handler
    navigate('/handler/sign-out');
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] flex flex-col justify-between bg-[#232347] shadow-lg z-30">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            <img src={mutsynchLogo.src} alt="MutSyncHub Logo" className="h-10 w-10 rounded-lg shadow-lg" />
          </div>
          <nav className="flex flex-col gap-2 mt-6 px-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-4 py-2 font-semibold transition-colors duration-150
                  ${location.pathname === link.to ? 'bg-[#282A36] text-amber-400 shadow-lg' : 'text-gray-200 hover:bg-[#282A36]'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Profile/Logout */}
        <div className="flex flex-col items-center gap-2 px-6 pb-8">
          <button
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 bg-[#232347] hover:bg-[#282A36] text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
            onClick={() => setProfileOpen(v => !v)}
          >
            <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{user?.name || user?.email || 'Admin'}</span>
          </button>
          {profileOpen && (
            <div className="absolute bottom-20 left-6 w-48 bg-[#232347] rounded-lg shadow-xl py-2 z-50 border border-[#282A36] animate-fade-in">
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#282A36]">{user?.email || ''}</div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#282A36] rounded-b-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 ml-[260px] min-h-screen bg-gradient-to-b from-[#321F61] to-[#1F224D] transition-all duration-300">
        <main className="max-w-5xl mx-auto pt-4 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
