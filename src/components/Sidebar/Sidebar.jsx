import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { subscribeToChats } from '../../firebase/chat';
import { Dumbbell, Trophy, User, Flame, MessageCircle, Settings, Info } from 'lucide-react';

export default function Sidebar({ user, userData, onSignOut }) {
  const [totalUnread, setTotalUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribeToChats(user.uid, (chats) => {
      const total = chats.reduce((sum, c) => sum + (c.unreadCounts?.[user.uid] || 0), 0);
      setTotalUnread(total);
    });
    return () => unsub();
  }, [user.uid]);

  const ir = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const navItems = [
    { path: '/',         label: 'Entrenar',     Icon: Dumbbell },
    { path: '/ligas',    label: 'Ligas Fantasy', Icon: Trophy },
    { path: '/calorias', label: 'Calorías',      Icon: Flame },
    { path: '/chat',     label: 'Mensajes',      Icon: MessageCircle },
    { path: '/perfil',   label: 'Perfil',        Icon: User },
    { path: '/ajustes',  label: 'Ajustes',       Icon: Settings },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <img src="/logo.png" alt="Logo" className="mobile-topbar-logo" />
        <button className="mobile-menu-btn" onClick={() => setMobileOpen((o) => !o)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {mobileOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
          {totalUnread > 0 && <span className="mobile-menu-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar (desktop always visible, mobile slide-in) */}
      <nav className={`sidebar ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <img src="/logo.png" alt="FGL Logo" className="sidebar-logo-img" />

        <div className="menu">
          {navItems.map(({ path, label, Icon }) => (
            <button
              key={path}
              onClick={() => ir(path)}
              className={`menu-btn ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.85 }} />
              <span>{label}</span>
              {path === '/chat' && totalUnread > 0 && (
                <span className="sidebar-unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => ir('/about')}
          className="about-sidebar-btn"
        >
          <Info size={14} strokeWidth={2} />
          About Us
        </button>

        <div className="user-section">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'U')}&background=111&color=fff`}
            alt="profile"
            className="user-avatar"
          />
          <div className="user-info">
            <p className="user-name">{userData?.displayName || user.displayName}</p>
            <button onClick={onSignOut} className="logout-btn">Cerrar sesión</button>
          </div>
        </div>
      </nav>
    </>
  );
}
