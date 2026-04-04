import { useState, useEffect } from 'react';

const Sidebar = ({ navigate, currentChatId, onSelectChat, currentRepo }) => {
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(currentChatId);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('chat_history') || '[]');
    setHistory(stored);
  }, [currentChatId]); // re-read when new chat is created

  const handleSelect = (chat) => {
    setActiveId(chat.id);
    onSelectChat(chat);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem('chat_history', JSON.stringify(updated));
    setHistory(updated);
    if (activeId === id) navigate('home');
  };

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: '#0f1219',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
        
        {/* New chat button */}
        <button
          onClick={() => navigate('home')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(79,142,247,0.2)',
            background: 'rgba(79,142,247,0.06)',
            color: '#4f8ef7', fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', marginBottom: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,142,247,0.06)'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New chat
        </button>

        {/* Section label */}
        <p style={{
          fontSize: '10px', textTransform: 'uppercase',
          letterSpacing: '1.5px', color: '#2a3040',
          fontWeight: '600', padding: '4px 6px',
        }}>
          {history.length > 0 ? 'History' : ''}
        </p>

        {/* Empty state */}
        {history.length === 0 && (
          <div style={{ padding: '24px 12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#2a3040', lineHeight: '1.6' }}>
              No chats yet.<br/>Explore a repo to get started!
            </p>
          </div>
        )}

        {/* History items */}
        {history.map(h => (
          <div
            key={h.id}
            onClick={() => handleSelect(h)}
            style={{
              padding: '10px 12px', borderRadius: '10px',
              cursor: 'pointer', transition: 'all 0.15s',
              background: activeId === h.id ? 'rgba(79,142,247,0.1)' : 'transparent',
              borderLeft: activeId === h.id ? '2px solid #4f8ef7' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between',
            }}
            onMouseEnter={e => { if (activeId !== h.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { if (activeId !== h.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{
                fontSize: '13px',
                color: activeId === h.id ? '#c8cad8' : '#5a6275',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                marginBottom: '3px',
                fontWeight: activeId === h.id ? '500' : '400',
              }}>{h.repoUrl}</p>
              <p style={{ fontSize: '11px', color: '#2a3040' }}>{h.time}</p>
            </div>

            {/* Delete button */}
            <div
              onClick={(e) => handleDelete(e, h.id)}
              style={{ color: '#2a3040', flexShrink: 0, padding: '2px', borderRadius: '4px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#2a3040'; e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;