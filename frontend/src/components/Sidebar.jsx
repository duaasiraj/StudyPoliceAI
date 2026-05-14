import { useState, useEffect } from 'react'

const NAV = [
  { id: 'landing', label: 'Home' },
  { id: 'chat', label: 'Chat' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'settings', label: 'Settings' },
]

export default function Sidebar({ page, setPage }) {
  const [studyMode, setStudyMode] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/api/settings/')
      .then(r => r.json())
      .then(d => setStudyMode(d.study_mode))
      .catch(() => {})
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        StudyPolice AI
      </div>
      <div className="sidebar-logo">
        Kiun Nahein Hoti Parhai?
      </div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="study-mode">
          Study mode: {studyMode ? 'On' : 'Off'}
        </div>
      </div>
    </aside>
  )
}