const HomeView = ({ setRepoUrl, navigate }) => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0f14',
    padding: '32px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Grid background */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(79,142,247,0.1) 1px, transparent 0)',
      backgroundSize: '36px 36px',
      pointerEvents: 'none',
    }} />

    {/* Glow */}
    <div style={{
      position: 'absolute',
      width: '600px', height: '600px',
      background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)',
      borderRadius: '50%', pointerEvents: 'none',
    }} />

    <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', width: '100%' }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '6px 16px', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        marginBottom: '28px',
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6fecc8', boxShadow: '0 0 8px #6fecc8' }} />
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6a7585', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Codebase Explorer
        </span>
      </div>

      {/* Heading */}
      <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', marginBottom: '16px', color: '#e8eaf0' }}>
        Explore any repo,
        <br />
        <span style={{
          background: 'linear-gradient(90deg, #4f8ef7, #6fecc8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          understand instantly.
        </span>
      </h1>

      <p style={{ fontSize: '17px', color: '#4a5570', marginBottom: '40px', lineHeight: '1.7' }}>
        Paste a GitHub link and start chatting with any codebase.
      </p>

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: '#161b26',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '6px',
        gap: '8px', width: '100%',
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ paddingLeft: '12px', color: '#3a4050' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          placeholder="https://github.com/owner/repository"
          onChange={(e) => setRepoUrl(e.target.value.replace('https://github.com/', ''))}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('chat'); }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'monospace', fontSize: '13px', color: '#e8eaf0',
            padding: '12px 4px',
          }}
        />
        <button
          onClick={() => navigate('chat')}
          style={{
            background: 'linear-gradient(135deg, #4f8ef7, #6ba3fa)',
            color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '12px',
            fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(79,142,247,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Explore →
        </button>
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {['vercel/next.js', 'facebook/react', 'tailwindlabs/tailwindcss', 'vitejs/vite'].map(r => (
          <span
            key={r}
            style={{ fontSize: '12px', color: '#4f8ef7', fontFamily: 'monospace', cursor: 'pointer', opacity: 0.6 }}
            onMouseEnter={e => e.target.style.opacity = 1}
            onMouseLeave={e => e.target.style.opacity = 0.6}
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default HomeView;