import React from 'react';

export default function ChatSessionList({ sessions, onSelect }) {
  return (
    <div>
      {sessions.map(session => (
        <div key={session.session_id} onClick={() => onSelect(session)}>
          {session.title} <small>({new Date(session.created_at).toLocaleString()})</small>
        </div>
      ))}
    </div>
  );
}
