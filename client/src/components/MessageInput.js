import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div>
      <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type message..." />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
