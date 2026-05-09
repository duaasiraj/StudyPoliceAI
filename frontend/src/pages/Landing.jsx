export default function Landing({ setPage }) {
  return (
    
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,77,109,0.12) 0%, transparent 70%)',
    }}>

    <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '30px' }}>
        AI-Powered Academic Enforcer
    </div>

    <h1 style={{
        fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 800,
        lineHeight: 1.0, letterSpacing: '-2px', marginBottom: '30px',
        color: 'var(--heading)',
      }}>
        STUDY  <span style={{ color: 'var(--accent)' }}>  POLICE</span>
    </h1>


    <h2 style={{
        fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 400,
        color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '40px',
        fontFamily: 'var(--mono)',
      }}>
        Kiun nahein hoti parhai?
    </h2>

    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
        <button className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 28px' }} onClick={() => setPage('chat')}>
          Talk to the AI
        </button>
        <button className="btn" style={{ fontSize: '15px', padding: '12px 28px' }} onClick={() => setPage('dashboard')}>
          View Dashboard
        </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '1200px', width: '100%' }}>
        {[
          { icon: '🔥', title: 'Roast Engine', desc: 'Gets brutally honest when you procrastinate' },
          { icon: '📐', title: 'Scheduler', desc: 'Generate a study plan surrounding your (non-existent) life' },
          { icon: '👨‍👩‍👧', title: '4 Personas', desc: 'Advisor, Crisis Planner, Desi Parent, Roaster' },
          { icon: '⚡', title: 'Study Mode', desc: 'Off-topic messages during this mode trigger the roast persona' },
        ].map(f => (
          <div key={f.title} className="card" style={{textAlign: 'left'}}>
            <div style={{fontSize: '24px', marginBottom: '8px'}}>{f.icon}</div>
            <div style={{fontWeight: 700, color: 'var(--heading)', fontSize: '30px', marginBottom: '4px' }}>{f.title}</div>
            <div style={{fontSize: '16px', color: 'var(--text)'}}>{f.desc}</div>
          </div>
        ))}
    </div>


    </div>
  )
}
