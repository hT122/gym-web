import React, { useState, useEffect, useRef } from 'react';
import { subscribeToLeagueMessages, sendLeagueMessage } from '../../firebase/chat';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function LeagueChat({ ligaId, user, userData }) {
  const [messages, setMessages] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);
  const myName = userData?.displayName || user.displayName || 'Yo';

  useEffect(() => {
    const unsub = subscribeToLeagueMessages(ligaId, setMessages);
    return () => unsub();
  }, [ligaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const txt = texto;
    setTexto('');
    try {
      await sendLeagueMessage(ligaId, user.uid, myName, txt);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  return (
    <div className="league-chat">
      <div className="chat-messages league-chat-messages">
        {messages.length === 0 && (
          <p className="chat-no-messages">Nadie ha escrito todavía. ¡Sé el primero! 💬</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user.uid;
          return (
            <div key={msg.id} className={`message-row ${isOwn ? 'mine' : 'theirs'}`}>
              {!isOwn && <p className="league-msg-sender">{msg.senderName}</p>}
              <div className={`message-bubble ${isOwn ? 'message-mine' : 'message-theirs'}`}>
                <p className="message-text">{msg.text}</p>
                <div className="message-meta">
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <textarea
          className="chat-input"
          placeholder="Escribe al grupo..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
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
    </div>
  );
}
