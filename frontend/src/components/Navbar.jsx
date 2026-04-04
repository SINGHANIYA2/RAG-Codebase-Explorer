const PAGES = ['home', 'chat'];

const Navbar = ({ currentPage, navigate }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    height: '52px',
    background: 'rgba(13,15,20,0.98)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
    position: 'relative',
  }}>
    {/* Left — nav links */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {PAGES.map((p) => (
        <button
          key={p}
          onClick={() => navigate(p)}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s',
            background: currentPage === p ? '#4f8ef7' : 'transparent',
            color: currentPage === p ? 'white' : '#555',
          }}
          onMouseEnter={e => { if (currentPage !== p) { e.target.style.color = '#bbb'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}}
          onMouseLeave={e => { if (currentPage !== p) { e.target.style.color = '#555'; e.target.style.background = 'transparent'; }}}
        >
          {p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}
        </button>
      ))}
    </div>

    {/* Center — App name */}
    <div style={{
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      {/* Logo mark */}
      <div style={{
        width: '26px', height: '26px',
        background: 'linear-gradient(135deg, #4f8ef7, #6fecc8)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: '800', color: 'white',
        boxShadow: '0 0 12px rgba(79,142,247,0.4)',
      }}>✦</div>

      {/* Name */}
      <span style={{
        fontSize: '15px',
        fontWeight: '700',
        letterSpacing: '0.3px',
        background: 'linear-gradient(90deg, #e8eaf0, #9aa8c0)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        CodeBase Explorer
      </span>
    </div>
  </div>
);

export default Navbar;