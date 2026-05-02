import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  Menu,
  User as UserIcon,
  Shield,
  Palette
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div className={`app-layout ${isPinned ? 'is-pinned' : ''}`}>
      {/* ─── Sidebar ────────────────────────────── */}
      <aside className={`sidebar ${isPinned ? 'is-pinned' : ''}`}>
        <div className="sidebar-header" style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="menu-toggle-wrapper" onClick={() => setIsPinned(!isPinned)}>
            <div className="menu-toggle-btn">
              <Menu size={20} color="#ffffff" />
            </div>
            <span className="menu-toggle-text">{isPinned ? "Collapse menu" : "Expand menu"}</span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <div className="sidebar-section-label">Main Menu</div>
          <NavLink to="/dashboard" className="nav-link">
            <LayoutGrid size={20} />
            <span className="nav-link-text">Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className="nav-link">
            <FolderKanban size={20} />
            <span className="nav-link-text">Projects</span>
          </NavLink>
          <NavLink to="/users" className="nav-link">
            <Users size={20} />
            <span className="nav-link-text">Team Members</span>
          </NavLink>

          <div className="sidebar-section-label">System</div>
          <NavLink to="/settings" className="nav-link">
            <Settings size={20} />
            <span className="nav-link-text">Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-ghost btn-icon btn-sm logout-btn" 
              style={{ padding: 4, color: 'var(--clr-text-light)' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Topbar ─────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LayoutGrid size={22} color="var(--clr-primary)" />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.04em', color: 'var(--clr-text)' }}>TeamTask</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, color: 'var(--clr-text-light)' }} />
            <input 
              type="text" 
              placeholder="Search tasks, projects..." 
              className="form-control"
              style={{ width: 280, paddingLeft: 42, background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="var(--clr-text-muted)" style={{ cursor: 'pointer', opacity: 0.7 }} />
            
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div 
                className="topbar-avatar" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {initials}
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown animate-slide">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{initials}</div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-name">{user?.name}</div>
                      <div className="dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-body">
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                      <UserIcon size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                      <Shield size={18} />
                      <span>Account Security</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                      <Palette size={18} />
                      <span>Appearance</span>
                    </Link>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-footer">
                    <button className="dropdown-item logout-link" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────── */}
      <main className="main-content animate-fade">
        <Outlet />
      </main>
    </div>
  );
}
