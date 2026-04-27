import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getOrCreateChat, sendMessage, subscribeToMessages, subscribeToChat, markAsRead, clearChat, cargarMensajesAnteriores, setTyping } from '../../firebase/chat';
import { bloquearUsuario, desbloquearUsuario, subscribeToUserDoc } from '../../firebase/users';

function formatTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function Ticks({ status }) {
  if (status === 'read') {
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0 }}>
        <path d="M1 5.5L4.5 9L10 2" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5.5L8.5 9L14 2" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (status === 'delivered') {
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0 }}>
        <path d="M1 5.5L4.5 9L10 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5.5L8.5 9L14 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 5.5L4.5 9L9 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function getTickStatus(msg, friendUid, lastReadAt) {
  const friendRead = lastReadAt?.[friendUid];
  if (friendRead && msg.timestamp <= friendRead) return 'read';
  if (friendRead) return 'delivered';
  return 'sent';
}

function MessageBubble({ msg, isOwn, friendUid, lastReadAt }) {
  const status = isOwn ? getTickStatus(msg, friendUid, lastReadAt) : null;
  return (
    <div className={`message-row ${isOwn ? 'mine' : 'theirs'}`}>
      <div className={`message-bubble ${isOwn ? 'message-mine' : 'message-theirs'}`}>
        <p className="message-text">{msg.text}</p>
        <div className="message-meta">
          <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
          {isOwn && <Ticks status={status} />}
        </div>
      </div>
    </div>
  );
}

function ChatMenu({ onClear, onBlock, onUnblock, isBlocked }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="chat-menu-wrapper" ref={ref}>
      <button className="chat-menu-btn" onClick={() => setOpen((o) => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
      {open && (
        <div className="chat-menu-dropdown">
          <button className="chat-menu-item" onClick={() => { onClear(); setOpen(false); }}>
            🗑️ Limpiar chat
          </button>
          <button
            className={`chat-menu-item ${isBlocked ? '' : 'chat-menu-item--danger'}`}
            onClick={() => { isBlocked ? onUnblock() : onBlock(); setOpen(false); }}
          >
            {isBlocked ? '✅ Desbloquear usuario' : '🚫 Bloquear usuario'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatWindow({ user, userData, chatInfo, onBack }) {
  const [messages, setMessages] = useState([]);
  const [mensajesAntiguos, setMensajesAntiguos] = useState([]);
  const [hasMasAntiguos, setHasMasAntiguos] = useState(false);
  const [cargandoAntiguos, setCargandoAntiguos] = useState(false);
  const [chatDoc, setChatDoc] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const [texto, setTexto] = useState('');
  const [chatId, setChatId] = useState(null);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isBlocked = chatInfo ? !!(userData?.blockedUsers?.[chatInfo.friendUid]) : false;
  const iBlockedByFriend = chatInfo ? !!(friendData?.blockedUsers?.[user.uid]) : false;

  useEffect(() => {
    if (!chatInfo) return;
    setMessages([]);
    setMensajesAntiguos([]);
    setHasMasAntiguos(false);
    setChatDoc(null);
    setCargandoChat(true);
    clearTimeout(typingTimeoutRef.current);
    setChatId((prevChatId) => {
      if (prevChatId) setTyping(prevChatId, user.uid, false).catch(() => {});
      return null;
    });
    getOrCreateChat(user.uid, chatInfo.friendUid, chatInfo.myName, chatInfo.friendName)
      .then(setChatId)
      .finally(() => setCargandoChat(false));
  }, [chatInfo, user.uid]);

  useEffect(() => {
    if (!chatInfo) return;
    const unsub = subscribeToUserDoc(chatInfo.friendUid, setFriendData);
    return () => unsub();
  }, [chatInfo]);

  useEffect(() => {
    if (!chatId) return;
    const unsubMsg = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setHasMasAntiguos((prev) => prev || msgs.length >= 50);
    });
    const unsubChat = subscribeToChat(chatId, setChatDoc);
    markAsRead(chatId, user.uid);
    return () => { unsubMsg(); unsubChat(); };
  }, [chatId, user.uid]);

  useEffect(() => {
    if (!chatId || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.senderId !== user.uid) markAsRead(chatId, user.uid);
  }, [messages, chatId, user.uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCargarAntiguos = async () => {
    const todosLosMensajes = [...mensajesAntiguos, ...messages];
    const primerTimestamp = todosLosMensajes[0]?.timestamp;
    if (!primerTimestamp || !chatId) return;
    setCargandoAntiguos(true);
    try {
      const anteriores = await cargarMensajesAnteriores(chatId, primerTimestamp);
      setMensajesAntiguos((prev) => [...anteriores, ...prev]);
      setHasMasAntiguos(anteriores.length >= 50);
      if (anteriores.length > 0) topRef.current?.scrollIntoView();
    } finally {
      setCargandoAntiguos(false);
    }
  };

  const handleTextoChange = (e) => {
    setTexto(e.target.value);
    if (!chatId) return;
    clearTimeout(typingTimeoutRef.current);
    setTyping(chatId, user.uid, true).catch(() => {});
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatId, user.uid, false).catch(() => {});
    }, 3500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !chatId || enviando || isBlocked) return;
    clearTimeout(typingTimeoutRef.current);
    setTyping(chatId, user.uid, false).catch(() => {});
    setEnviando(true);
    const txt = texto;
    setTexto('');
    try {
      await sendMessage(chatId, user.uid, chatInfo.myName, txt, chatInfo.friendUid);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  const handleClear = async () => {
    if (!chatId) return;
    await clearChat(chatId);
    toast('Conversación limpiada');
  };

  const handleBlock = async () => {
    await bloquearUsuario(user.uid, chatInfo.friendUid);
    toast(`${chatInfo.friendName} bloqueado`);
  };

  const handleUnblock = async () => {
    await desbloquearUsuario(user.uid, chatInfo.friendUid);
    toast.success(`${chatInfo.friendName} desbloqueado`);
  };

  if (!chatInfo) {
    return (
      <div className="chat-empty-state">
        <p className="chat-empty-icon">💬</p>
        <p className="chat-empty-text">Selecciona un amigo para empezar a chatear</p>
      </div>
    );
  }

  const lastReadAt = chatDoc?.lastReadAt || {};
  const friendTypingAt = chatDoc?.typing?.[chatInfo?.friendUid];
  const friendIsTyping = friendTypingAt
    && (Date.now() - new Date(friendTypingAt).getTime()) < 5000;

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <button className="chat-back-btn" onClick={onBack} aria-label="Volver">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chatInfo.friendName)}&background=111&color=fff&size=80`}
          alt={chatInfo.friendName}
          className="chat-header-avatar"
        />
        <p className="chat-header-name">{chatInfo.friendName}</p>
        <ChatMenu
          onClear={handleClear}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          isBlocked={isBlocked}
        />
      </div>

      <div className="chat-messages">
        <div ref={topRef} />
        {cargandoChat ? (
          <p className="chat-no-messages">Cargando mensajes...</p>
        ) : (
          <>
            {hasMasAntiguos && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <button
                  className="btn-secondary"
                  onClick={handleCargarAntiguos}
                  disabled={cargandoAntiguos}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {cargandoAntiguos ? 'Cargando...' : 'Cargar mensajes anteriores'}
                </button>
              </div>
            )}
            {[...mensajesAntiguos, ...messages].length === 0 && !isBlocked && (
              <p className="chat-no-messages">Di hola a {chatInfo.friendName} 👋</p>
            )}
            {[...mensajesAntiguos, ...messages].map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.senderId === user.uid}
                friendUid={chatInfo.friendUid}
                lastReadAt={lastReadAt}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="typing-indicator">
        {friendIsTyping && (
          <>
            <span>{chatInfo.friendName} está escribiendo </span>
            <span className="typing-dots">
              <span /><span /><span />
            </span>
          </>
        )}
      </div>

      {isBlocked ? (
        <div className="chat-blocked-bar">
          Has bloqueado a {chatInfo.friendName} ·{' '}
          <button className="chat-blocked-unblock" onClick={handleUnblock}>Desbloquear</button>
        </div>
      ) : iBlockedByFriend ? (
        <div className="chat-blocked-bar">
          No puedes enviar mensajes a este usuario.
        </div>
      ) : (
        <form className="chat-input-area" onSubmit={handleSend}>
          <textarea
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={texto}
            onChange={handleTextoChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button type="submit" className="chat-send-btn" disabled={!texto.trim() || enviando}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
