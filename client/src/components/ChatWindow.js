import React, { useEffect, useRef } from 'react';

export default function ChatWindow({ messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid black', padding: '10px' }}>
      {messages.map((msg, idx) => (
        <div key={idx} style={{ textAlign: msg.sender_role === 'user' ? 'right' : 'left', margin: '5px 0' }}>
          <b>{msg.sender_role}:</b> {msg.message_text}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
