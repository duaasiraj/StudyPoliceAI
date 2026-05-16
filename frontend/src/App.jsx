import {useState, useEffect} from 'react'
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

  const [studyMode, setStudyMode] = useState(false)

  useEffect(() => {

      fetch('http://localhost:8000/api/settings/')
      .then(r=>r.json())
      .then(d=> setStudyMode(d.study_mode))
      .catch(()=>{})
  },[])


  const PageComponent = PAGES[page] || Landing

  
  return (
    <div className="app-shell">
      {page !== 'landing' && <Sidebar page={page} setPage={setPage} studyMode={studyMode}/>}
      <div className={page !== 'landing' ? 'main-content' : ''} style={{ flex: 1, minWidth: 0 }}>
        <PageComponent setPage={setPage} studyMode={studyMode} setStudyMode={setStudyMode}/>
      </div>
    </div>
  )
}
