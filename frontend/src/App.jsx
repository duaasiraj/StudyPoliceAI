import { useState } from 'react'
import './index.css'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Assessments from './pages/Assessments'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'

const PAGES = {
  landing: Landing,
  chat: Chat,
  dashboard: Dashboard,
  schedule: Schedule,
  assessments: Assessments,
  calendar: Calendar,
  settings: Settings,
}

export default function App(){

  const [page, setPage] = useState('landing')
  const PageComponent = PAGES[page] || Landing

  const isFullPage = page === 'chat' || page === 'landing'
  
  return (
    <div className="app-shell">
      {page !== 'landing' && <Sidebar page={page} setPage={setPage} />}
      <div className={page !== 'landing' ? 'main-content' : ''} style={{ flex: 1, minWidth: 0 }}>
        <PageComponent setPage={setPage} />
      </div>
    </div>
  )
}
