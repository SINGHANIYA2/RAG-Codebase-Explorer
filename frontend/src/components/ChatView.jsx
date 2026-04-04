import { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';

const AI_RESPONSES = [
  'The pages/ directory uses the older Pages Router, while app/ uses the new App Router with React Server Components.',
  'Server Components run only on the server — they never ship JS to the client.',
  'Middleware runs on the Edge Runtime — find it in middleware.ts at the root.',
  'The next.config.js controls compiler options, rewrites, redirects, and image domains.',
];

const ChatView = ({ repoUrl, navigate }) => {
  const initialHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
  const existingChat = initialHistory.find(h => h.repoUrl === repoUrl);

  const [chatId, setChatId] = useState(existingChat ? existingChat.id : `chat_${Date.now()}`);
  const [currentRepo, setCurrentRepo] = useState(repoUrl);
  const [messages, setMessages] = useState(
    existingChat
      ? existingChat.messages
      : [{ role: 'ai', text: `I've indexed ${repoUrl} — what would you like to explore?` }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const aiIdx = useRef(0);
  const bottomRef = useRef(null);

  // Save to localStorage on every message change
  useEffect(() => {
    if (messages.length === 0) return;
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    const existing = history.find(h => h.id === chatId);
    const chatEntry = {
      id: chatId,
      repoUrl: currentRepo || 'unknown',
      messages,
      time: existing?.time || new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: existing?.date || Date.now(),
    };
    const updated = existing
      ? history.map(h => h.id === chatId ? chatEntry : h)
      : [chatEntry, ...history];
    localStorage.setItem('chat_history', JSON.stringify(updated));
  }, [messages, chatId, currentRepo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Switch to a different chat from sidebar
  const handleSelectChat = (chat) => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    const selected = history.find(h => h.id === chat.id);
    if (selected) {
      setChatId(selected.id);
      setCurrentRepo(selected.repoUrl);
      setMessages(selected.messages);
    }
  };

  const sendMsg = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: AI_RESPONSES[aiIdx.current++ % AI_RESPONSES.length] },
      ]);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
      <Sidebar navigate={navigate} currentChatId={chatId} onSelectChat={handleSelectChat} currentRepo={currentRepo} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0f14' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(111,236,200,0.08)',
            border: '1px solid rgba(111,236,200,0.2)',
            borderRadius: '8px', padding: '5px 12px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6fecc8" strokeWidth="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6fecc8', fontWeight: '500' }}>
              {currentRepo || 'vercel/next.js'}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '4px 10px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5">
              <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
            </svg>
            <span style={{ fontSize: '11px', color: '#555', fontFamily: 'monospace' }}>main</span>
          </div>
          <span style={{ fontSize: '11px', color: '#333a4a', marginLeft: 'auto' }}>
            4,200 files · 312k lines indexed
          </span>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '28px 32px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700',
                background: m.role === 'ai' ? 'rgba(79,142,247,0.15)' : 'rgba(111,236,200,0.12)',
                color: m.role === 'ai' ? '#4f8ef7' : '#6fecc8',
                border: m.role === 'ai' ? '1px solid rgba(79,142,247,0.25)' : '1px solid rgba(111,236,200,0.2)',
              }}>
                {m.role === 'ai' ? 'AI' : 'U'}
              </div>
              <div style={{
                maxWidth: '68%', padding: '12px 16px',
                borderRadius: m.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                fontSize: '14px', lineHeight: '1.65',
                background: m.role === 'ai' ? '#161b26' : 'rgba(79,142,247,0.12)',
                border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(79,142,247,0.25)',
                color: m.role === 'ai' ? '#c8cad8' : '#e8eaf0',
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700',
                background: 'rgba(79,142,247,0.15)', color: '#4f8ef7',
                border: '1px solid rgba(79,142,247,0.25)',
              }}>AI</div>
              <div style={{
                padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
                background: '#161b26', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '5px', alignItems: 'center',
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#3a4560',
                    animation: 'bounce 1.2s infinite',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: '#0d0f14', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#161b26',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '8px 8px 8px 18px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Ask about the code..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '14px', color: '#e8eaf0', padding: '8px 0',
              }}
            />
            <button
              onClick={sendMsg}
              style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                background: input.trim() ? 'linear-gradient(135deg, #4f8ef7, #6ba3fa)' : 'rgba(255,255,255,0.05)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: input.trim() ? '0 4px 12px rgba(79,142,247,0.3)' : 'none',
              }}
            >
              <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#2a3040', textAlign: 'center', marginTop: '10px' }}>
            Press Enter to send · Chat saved automatically
          </p>
        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatView;