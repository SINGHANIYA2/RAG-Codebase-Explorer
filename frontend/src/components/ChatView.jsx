import { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';

/* ------------------------------------------------------------------ */
/*  Lightweight markdown → JSX renderer (no external dependency)       */
/*  Handles: code blocks, inline code, bold, italic, headings, lists  */
/* ------------------------------------------------------------------ */
const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block ```
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={elements.length} style={{
          background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '14px 16px', margin: '10px 0',
          overflowX: 'auto', fontSize: '13px', lineHeight: '1.5',
          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          color: '#c9d1d9',
        }}>
          {lang && <span style={{ fontSize: '10px', color: '#4f8ef7', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>{lang}</span>}
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = { 1: '20px', 2: '17px', 3: '15px', 4: '14px' };
      elements.push(
        <div key={elements.length} style={{
          fontSize: sizes[level], fontWeight: '700', color: '#e8eaf0',
          margin: '14px 0 6px', lineHeight: '1.4',
        }}>
          {renderInline(headingMatch[2])}
        </div>
      );
      i++;
      continue;
    }

    // Unordered list items
    if (line.match(/^\s*[-*]\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        listItems.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={elements.length} style={{ margin: '6px 0', paddingLeft: '20px' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ margin: '3px 0', lineHeight: '1.6' }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list items
    if (line.match(/^\s*\d+\.\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        listItems.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={elements.length} style={{ margin: '6px 0', paddingLeft: '20px' }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{ margin: '3px 0', lineHeight: '1.6' }}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(
        <hr key={elements.length} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 0' }} />
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={elements.length} style={{ height: '8px' }} />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={elements.length} style={{ margin: '4px 0', lineHeight: '1.65' }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
};

/* Inline markdown: **bold**, *italic*, `code` */
const renderInline = (text) => {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let match = remaining.match(/^(.*?)\*\*(.+?)\*\*/s);
    if (!match) match = remaining.match(/^(.*?)__(.+?)__/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<strong key={key++} style={{ color: '#e8eaf0', fontWeight: '600' }}>{match[2]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    match = remaining.match(/^(.*?)`(.+?)`/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(
        <code key={key++} style={{
          background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)',
          borderRadius: '4px', padding: '1px 5px', fontSize: '12px',
          fontFamily: "'Fira Code', monospace", color: '#6ba3fa',
        }}>{match[2]}</code>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    match = remaining.match(/^(.*?)\*(.+?)\*/s);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<em key={key++}>{match[2]}</em>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
};


/* ------------------------------------------------------------------ */
/*  Debug Metadata Banner                                              */
/* ------------------------------------------------------------------ */
const DebugMetaBanner = ({ meta }) => {
  if (!meta) return null;
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px',
      padding: '8px 12px', borderRadius: '8px',
      background: 'rgba(255,107,53,0.06)',
      border: '1px solid rgba(255,107,53,0.15)',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: '700', color: '#ff6b35',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        🐛 DEBUG MODE
      </span>
      <span style={{ fontSize: '11px', color: '#888', margin: '0 4px' }}>|</span>
      <span style={{ fontSize: '11px', color: '#999' }}>
        📂 {meta.files_analyzed?.length || 0} files analyzed
      </span>
      <span style={{ fontSize: '11px', color: '#888', margin: '0 4px' }}>|</span>
      <span style={{ fontSize: '11px', color: '#999' }}>
        🧩 {meta.chunks_used || 0} code chunks scanned
      </span>
      {meta.files_analyzed && meta.files_analyzed.length > 0 && (
        <div style={{ width: '100%', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>
            Files: {meta.files_analyzed.slice(0, 5).join(', ')}
            {meta.files_analyzed.length > 5 && ` +${meta.files_analyzed.length - 5} more`}
          </span>
        </div>
      )}
    </div>
  );
};


/* ------------------------------------------------------------------ */
/*  ChatView Component                                                 */
/* ------------------------------------------------------------------ */
const ChatView = ({ repoUrl, repoId, setRepoId, navigate, apiBase }) => {
  const initialHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
  const existingChat = initialHistory.find(h => h.repoUrl === repoUrl && h.repoId === repoId);

  const [chatId, setChatId] = useState(existingChat ? existingChat.id : `chat_${Date.now()}`);
  const [currentRepo, setCurrentRepo] = useState(repoUrl);
  const [currentRepoId, setCurrentRepoId] = useState(repoId);
  const [messages, setMessages] = useState(
    existingChat
      ? existingChat.messages
      : [{ role: 'ai', text: `I've indexed **${repoUrl}** — what would you like to explore?` }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const bottomRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    const existing = history.find(h => h.id === chatId);
    const chatEntry = {
      id: chatId,
      repoUrl: currentRepo || 'unknown',
      repoId: currentRepoId || '',
      messages,
      time: existing?.time || new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: existing?.date || Date.now(),
    };
    const updated = existing
      ? history.map(h => h.id === chatId ? chatEntry : h)
      : [chatEntry, ...history];
    localStorage.setItem('chat_history', JSON.stringify(updated));
  }, [messages, chatId, currentRepo, currentRepoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSelectChat = (chat) => {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    const selected = history.find(h => h.id === chat.id);
    if (selected) {
      setChatId(selected.id);
      setCurrentRepo(selected.repoUrl);
      setCurrentRepoId(selected.repoId || '');
      setMessages(selected.messages);
      if (selected.repoId && setRepoId) {
        setRepoId(selected.repoId);
      }
    }
  };

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const activeRepoId = currentRepoId || repoId;

    if (!activeRepoId) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text },
        { role: 'ai', text: '⚠️ No repository has been ingested yet. Please go back to Home and ingest a repository first.' },
      ]);
      setInput('');
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Choose endpoint: forced debug mode → /debug, else /smart-query (auto-detects)
    const endpoint = debugMode ? '/debug' : '/smart-query';

    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          repo_id: activeRepoId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMessage = `Server error: ${res.status}`;
        try {
          const errData = await res.json();
          errorMessage = errData.detail || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }

        if (res.status === 404) {
          errorMessage = '⚠️ Repository not found on the server. The server may have restarted. Please re-ingest the repository from the Home page.';
        } else if (res.status === 400) {
          errorMessage = `⚠️ ${errorMessage}. The repository may still be processing. Please wait and try again.`;
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();

      setIsTyping(false);
      abortControllerRef.current = null;

      const answer = data.answer;
      const isDebugResponse = data.mode === 'debug';
      const debugMeta = data.debug_meta || null;

      if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: 'The AI returned an empty response. Please try rephrasing your question.' },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: answer,
            isDebug: isDebugResponse,
            debugMeta: debugMeta,
          },
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      abortControllerRef.current = null;

      if (err.name === 'AbortError') return;

      let errorText = err.message;
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        errorText = '❌ Cannot reach the backend server. Make sure the server is running on ' + apiBase;
      }

      setMessages(prev => [
        ...prev,
        { role: 'ai', text: `❌ Error: ${errorText}` },
      ]);
    }
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
              {currentRepo || repoUrl || 'No repo'}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: currentRepoId ? 'rgba(111,236,200,0.06)' : 'rgba(255,255,255,0.04)',
            border: currentRepoId ? '1px solid rgba(111,236,200,0.15)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '4px 10px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: currentRepoId ? '#6fecc8' : '#555',
              boxShadow: currentRepoId ? '0 0 6px #6fecc8' : 'none',
            }} />
            <span style={{ fontSize: '11px', color: currentRepoId ? '#6fecc8' : '#555', fontFamily: 'monospace' }}>
              {currentRepoId ? 'Ready' : 'Not ingested'}
            </span>
          </div>

          {/* Debug Mode Indicator */}
          {debugMode && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.25)',
              borderRadius: '6px', padding: '4px 10px',
              animation: 'debugPulse 2s ease-in-out infinite',
            }}>
              <span style={{ fontSize: '12px' }}>🐛</span>
              <span style={{ fontSize: '11px', color: '#ff6b35', fontWeight: '600' }}>
                Debug Mode ON
              </span>
            </div>
          )}
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
                background: m.isDebug
                  ? 'rgba(255,107,53,0.15)'
                  : m.role === 'ai' ? 'rgba(79,142,247,0.15)' : 'rgba(111,236,200,0.12)',
                color: m.isDebug
                  ? '#ff6b35'
                  : m.role === 'ai' ? '#4f8ef7' : '#6fecc8',
                border: m.isDebug
                  ? '1px solid rgba(255,107,53,0.3)'
                  : m.role === 'ai' ? '1px solid rgba(79,142,247,0.25)' : '1px solid rgba(111,236,200,0.2)',
              }}>
                {m.isDebug ? '🐛' : m.role === 'ai' ? 'AI' : 'U'}
              </div>
              <div style={{
                maxWidth: '68%', padding: '12px 16px',
                borderRadius: m.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                fontSize: '14px', lineHeight: '1.65',
                background: m.isDebug
                  ? 'rgba(255,107,53,0.04)'
                  : m.role === 'ai' ? '#161b26' : 'rgba(79,142,247,0.12)',
                border: m.isDebug
                  ? '1px solid rgba(255,107,53,0.15)'
                  : m.role === 'ai' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(79,142,247,0.25)',
                color: m.role === 'ai' ? '#c8cad8' : '#e8eaf0',
                wordBreak: 'break-word',
              }}>
                {m.isDebug && m.debugMeta && <DebugMetaBanner meta={m.debugMeta} />}
                {m.role === 'ai' ? renderMarkdown(m.text) : m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700',
                background: debugMode ? 'rgba(255,107,53,0.15)' : 'rgba(79,142,247,0.15)',
                color: debugMode ? '#ff6b35' : '#4f8ef7',
                border: debugMode ? '1px solid rgba(255,107,53,0.3)' : '1px solid rgba(79,142,247,0.25)',
              }}>{debugMode ? '🐛' : 'AI'}</div>
              <div style={{
                padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
                background: debugMode ? 'rgba(255,107,53,0.04)' : '#161b26',
                border: debugMode ? '1px solid rgba(255,107,53,0.15)' : '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: '5px', alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: debugMode ? '#ff6b35' : '#4f8ef7', marginRight: '8px' }}>
                  {debugMode ? '🔍 Debugging...' : ''}
                </span>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: debugMode ? '#ff6b35' : '#3a4560',
                    animation: 'bounce 1.2s infinite',
                    animationDelay: `${j * 0.2}s`,
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
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#161b26',
            border: debugMode
              ? '1px solid rgba(255,107,53,0.25)'
              : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '8px 8px 8px 12px',
            transition: 'border-color 0.3s',
          }}>
            {/* Debug Toggle Button */}
            <button
              onClick={() => setDebugMode(!debugMode)}
              title={debugMode ? 'Debug mode ON (click to disable)' : 'Enable debug mode'}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: debugMode
                  ? 'linear-gradient(135deg, #ff6b35, #ff8f65)'
                  : 'rgba(255,255,255,0.04)',
                border: debugMode
                  ? '1px solid rgba(255,107,53,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.3s',
                boxShadow: debugMode ? '0 0 12px rgba(255,107,53,0.3)' : 'none',
              }}
            >
              🐛
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder={
                isTyping
                  ? (debugMode ? '🐛 Debugging...' : 'AI is thinking...')
                  : (debugMode ? '🐛 Describe the bug or paste error...' : 'Ask about the code...')
              }
              disabled={isTyping}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: '14px', color: '#e8eaf0', padding: '8px 0',
                opacity: isTyping ? 0.5 : 1,
              }}
            />
            <button
              onClick={sendMsg}
              disabled={isTyping}
              style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                background: input.trim() && !isTyping ? 'linear-gradient(135deg, #4f8ef7, #6ba3fa)' : 'rgba(255,255,255,0.05)',
                border: 'none', cursor: isTyping ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(79,142,247,0.3)' : 'none',
              }}
            >
              <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#2a3040', textAlign: 'center', marginTop: '10px' }}>
            Press Enter to send · {debugMode ? '🐛 Debug mode active — auto-analyzes bugs' : 'Click 🐛 to enable debug mode'} · Chat saved automatically
          </p>
        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes debugPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default ChatView;