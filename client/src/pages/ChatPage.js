import React, { useEffect, useState } from 'react';
import { getChatSessions, getChatMessages, createSession, sendMessage, getUserMetadata } from '../api/chats';
import ChatSessionList from '../components/ChatSessionList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

export default function ChatPage({ user_uid }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMetadata, setUserMetadata] = useState(null);   // NEW

  useEffect(() => {
    loadSessions();
    fetchUserMetadata();   // NEW
  }, []);

  const loadSessions = async () => {
    const res = await getChatSessions(user_uid);
    setSessions(res.data);
  };

  const loadMessages = async (session) => {
    setSelectedSession(session);
    const res = await getChatMessages(session.session_id);
    setMessages(res.data);
  };

  const fetchUserMetadata = async () => {
    const res = await getUserMetadata(user_uid);
    console.log('User metadata:', res.data);
    setUserMetadata({
      user_reg_number: res.data.user_reg_number,
      user_role: res.data.user_role,
    });
  };

  const handleSend = async (msg) => {
    if (!selectedSession) {
      alert('Please select a session first.');
      return;
    }

    await sendMessage(selectedSession.session_id, user_uid, msg, 'user');

    const payload = {
      sender: user_uid,
      message: msg,
      metadata: userMetadata,   // ALWAYS send metadata with every message
    };
    
    const rasaRes = await fetch('http://localhost:5005/webhooks/rest/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const rasaMessages = await rasaRes.json();

    for (const rasaMsg of rasaMessages) {
      if (rasaMsg.text) {
        await sendMessage(selectedSession.session_id, user_uid, rasaMsg.text, 'bot');
      }
    }

    await loadMessages(selectedSession);
  };

  const startNewChat = async () => {
    const res = await createSession(user_uid, 'New Chat');
    console.log('New session created:', res.data);

    await loadSessions();
    await loadMessages(res.data);
  };

  return (
    <div>
      <button onClick={startNewChat}>+ New Chat</button>
      <ChatSessionList sessions={sessions} onSelect={loadMessages} />
      {selectedSession && (
        <>
          <ChatWindow messages={messages} />
          <MessageInput onSend={handleSend} />
        </>
      )}
    </div>
  );
}
