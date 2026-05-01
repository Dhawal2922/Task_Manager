import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/users', icon: Users, label: 'Team Members', adminOnly: true },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="sidebar">
        <NavLink to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">Project<span>Flow</span></span>
        </NavLink>

        <div className="sidebar-section-label">Navigation</div>

        {navItems.map(({ to, icon: Icon, label, adminOnly }) => {
          if (adminOnly && user?.role !== 'Admin') return null;
          return (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          );
        })}

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <span className="user-role">{user?.role}</span>
            </div>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={handleLogout}
              title="Logout"
              id="btn-logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Top Bar ─────────────────────────────── */}
      <header className="topbar">
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <span className="topbar-title">Welcome back, <strong style={{ color: 'var(--clr-text)' }}>{user?.name?.split(' ')[0]}</strong> 👋</span>
        </div>
        <div className="topbar-actions">
          <span className={`badge ${user?.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
            {user?.role}
          </span>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────── */}
      <main className="main-content animate-fade">
        <Outlet />
      </main>
    </div>
  );
}
