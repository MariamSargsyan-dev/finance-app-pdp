import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.scss';

export function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '💸' },
    { path: '/accounts', label: 'Accounts', icon: '🏦' },
    { path: '/categories', label: 'Categories', icon: '📁' },
    { path: '/budgets', label: 'Budgets', icon: '💰' },
  ];

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Finance</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <h2 className="topbar-title">
            {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
          </h2>
          <div className="topbar-actions">
            <div className="user-menu" onClick={logout}>
              <div className="user-avatar">
                {user ? getInitials(user.email) : 'U'}
              </div>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
