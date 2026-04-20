import React, { useEffect, useState } from 'react';
import { obtenerAmigos } from '../../firebase/friends';
import { subscribeToChats, getChatId } from '../../firebase/chat';

function Avatar({ name, size = 40 }) {
  return (
    <img
      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=111&color=fff&size=${size * 2}`}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function ChatList({ user, userData, chatActivo, onSelectChat }) {
  const [amigos, setAmigos] = useState([]);
  const [chats, setChats] = useState({});

  useEffect(() => {
    obtenerAmigos(user.uid).then(setAmigos);
  }, [user.uid]);

  useEffect(() => {
    const unsub = subscribeToChats(user.uid, (lista) => {
      const map = {};
      lista.forEach((c) => { map[c.id] = c; });
      setChats(map);
    });
    return () => unsub();
  }, [user.uid]);

  const myName = userData?.displayName || user.displayName || 'Yo';

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <p className="chat-sidebar-title">Mensajes</p>
      </div>

      {amigos.length === 0 && (
        <p className="friends-empty" style={{ padding: '20px 16px' }}>
          Añade amigos para chatear.
        </p>
      )}

      {amigos.map((amigo) => {
        const chatId = getChatId(user.uid, amigo.friendUid);
        const chat = chats[chatId];
        const isActive = chatActivo?.chatId === chatId;
        const lastMsg = chat?.lastMessage || '';
        const lastTime = chat?.lastMessageTime || null;
        const lastMine = chat?.lastSenderId === user.uid;
        const unread = chat?.unreadCounts?.[user.uid] || 0;

        return (
          <button
            key={amigo.id}
            className={`chat-list-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectChat({ chatId, friendUid: amigo.friendUid, friendName: amigo.friendName, myName })}
          >
            <Avatar name={amigo.friendName} />
            <div className="chat-list-info">
              <div className="chat-list-top">
                <span className={`chat-list-name ${unread > 0 ? 'chat-list-name--unread' : ''}`}>
                  {amigo.friendName}
                </span>
                {lastTime && <span className="chat-list-time">{formatTime(lastTime)}</span>}
              </div>
              <div className="chat-list-bottom">
                {lastMsg && (
                  <p className={`chat-list-preview ${unread > 0 ? 'chat-list-preview--unread' : ''}`}>
                    {lastMine ? 'Tú: ' : ''}{lastMsg}
                  </p>
                )}
                {unread > 0 && (
                  <span className="chat-unread-badge">{unread > 99 ? '99+' : unread}</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
