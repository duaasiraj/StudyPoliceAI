import { useState, useEffect } from 'react'

const NAV = [
  {id: 'landing', icon: '⚡', label: 'Home' },
  {id: 'chat', icon: '💬', label: 'Chat' },
  {id: 'dashboard', icon: '✨', label: 'Dashboard' },
  {id: 'schedule', icon: '🗓️', label: 'Schedule' },
  {id: 'assessments',icon: '⚠️', label: 'Assessments' },
  {id: 'calendar', icon: '📅', label: 'Calendar' },
  {id: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ page, setPage }) {
  const [studyMode, setStudyMode] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/api/settings/')
      .then(r => r.json())
      .then(d => setStudyMode(d.study_mode))
      .catch(() => {})
  }, [page])

  const go = (id) => { setPage(id); setOpen(false) }

  return (
    <>
      <button className="hamburger" onClick={() => setOpen(o => !o)}>☰</button>
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div>STUDY<span>POLICE</span>.AI</div>
          <div className="tagline">Aise ghar nahein chale ga</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item${page === n.id ? ' active' : ''}`}
              onClick={() => go(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="study-mode-pill">
            <div className={`study-mode-dot${studyMode ? ' on' : ''}`} />
            Study Mode {studyMode ? 'ON' : 'OFF'}
          </div>
        </div>
      </aside>
    </>
  )
}
