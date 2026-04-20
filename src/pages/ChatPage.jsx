import React, { useState } from 'react';
import ChatList from '../components/ChatList/ChatList';
import ChatWindow from '../components/ChatWindow/ChatWindow';

export default function ChatPage({ user, userData }) {
  const [chatActivo, setChatActivo] = useState(null);

  return (
    <div className="chat-layout">
      <ChatList
        user={user}
        userData={userData}
        chatActivo={chatActivo}
        onSelectChat={setChatActivo}
      />
      <ChatWindow user={user} userData={userData} chatInfo={chatActivo} />
    </div>
  );
}
