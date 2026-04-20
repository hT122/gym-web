import React, { useEffect, useState } from 'react';
import { subscribeToChats } from '../../firebase/chat';

export default function Sidebar({ user, userData, activeTab, setActiveTab, onSignOut }) {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const unsub = subscribeToChats(user.uid, (chats) => {
      const total = chats.reduce((sum, c) => sum + (c.unreadCounts?.[user.uid] || 0), 0);
      setTotalUnread(total);
    });
    return () => unsub();
  }, [user.uid]);

  return (
    <nav className="sidebar">
      <img src="/logo.png" alt="FGL Logo" className="sidebar-logo-img" />

      <div className="menu">
        <button onClick={() => setActiveTab('entrenar')} className={`menu-btn ${activeTab === 'entrenar' ? 'active' : ''}`}>
          Entrenar
        </button>
        <button onClick={() => setActiveTab('ligas')} className={`menu-btn ${activeTab === 'ligas' ? 'active' : ''}`}>
          Ligas Fantasy
        </button>
        <button onClick={() => setActiveTab('perfil')} className={`menu-btn ${activeTab === 'perfil' ? 'active' : ''}`}>
          Perfil
        </button>
        <button onClick={() => setActiveTab('calorias')} className={`menu-btn ${activeTab === 'calorias' ? 'active' : ''}`}>
          Calorías
        </button>
        <button onClick={() => setActiveTab('chat')} className={`menu-btn ${activeTab === 'chat' ? 'active' : ''}`}>
          Mensajes
          {totalUnread > 0 && (
            <span className="sidebar-unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
          )}
        </button>
      </div>

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
  );
}
