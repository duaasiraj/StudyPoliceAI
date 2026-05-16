import { useState, useEffect } from 'react'

const PERSONAS = [
  {
    id: 'academic_advisor',
    label: 'Academic Advisor',
    desc: 'Structured guidance, references your actual deadlines and GPA gaps.',
  },
  {
    id: 'crisis_planner',
    label: 'Crisis Planner',
    desc: 'Cuts the fluff. Useful when something is due in 48 hours.',
  },
  {
    id: 'desi_parent',
    label: 'Desi Parent',
    desc: 'Guilt-driven motivation. Compares you to imaginary cousins.',
  },
]

export default function Settings({ studyMode, setStudyMode }) {
  const [settings, setSettings] = useState(null)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [switchingPersona, setSwitchingPersona] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, studentRes] = await Promise.all([
          fetch('http://localhost:8000/api/settings/'),
          fetch('http://localhost:8000/api/session/student'),
        ])

        const settingsData = await settingsRes.json()

        setSettings(settingsData)
        setStudyMode(settingsData.study_mode)
        setStudent(await studentRes.json())
      } catch {
        setError('Could not reach backend.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function toggleStudyMode() {
    try {
      const res = await fetch(
        'http://localhost:8000/api/settings/study-mode',
        {method: 'PATCH'}
      )

      const data = await res.json()

      setSettings(prev => ({
        ...prev,
        study_mode: data.study_mode,
      }))


      setStudyMode(data.study_mode)
    } catch {

      setError('Could not update study mode.')
    }
  }

  async function switchPersona(id) {
    setSwitchingPersona(id)

    try {
      const res = await fetch(
        `http://localhost:8000/api/settings/persona?persona=${id}`,
        {method: 'PATCH'}
      )

      const data = await res.json()

      setSettings(prev => ({
        ...prev,
        active_persona: data.active_persona,
      }))
    } catch {
      setError('Could not switch persona.')
    } finally {
      setSwitchingPersona(null)
    }
  }

  return (
    <div className="settings-page">

      <h1 style = {{fontFamily: 'var(--heading-font)', fontSize: '30px'}}>Settings</h1>

      <p style = {{fontFamily: 'var(--mono)', fontSize: '18px', marginTop: '-20px', marginBottom: '30px'}}>
        Persona, study mode, and account info.
      </p>

      {student && (
        <div className="settings-section">

          <h2 style = {{fontFamily: 'var(--mono)', fontSize: '20px', marginBottom: '10px'}}>
            Account
          </h2>

          <div className="card account-grid">

            <div className="account-item">
              <span className="account-item-label">Name</span>
              <span className="account-item-value">{student.name}</span>
            </div>

            <div className="account-item">
              <span className="account-item-label">Student ID</span>
              <span className="account-item-value">{student.student_id}</span>
            </div>

            <div className="account-item">
              <span className="account-item-label">Semester</span>
              <span className="account-item-value">
                Semester {student.semester}
              </span>
            </div>

            <div className="account-item">
              <span className="account-item-label">CGPA</span>
              <span className="account-item-value">
                {student.cgpa.toFixed(2)}
              </span>
            </div>

          </div>
        </div>
      )}

      {settings && (
        <div className="settings-section">

          <h2 style = {{fontFamily: 'var(--mono)', fontSize: '20px', marginBottom: '10px'}}>
            Study Mode
          </h2>

          <div className="card">

            <div className="study-row">

              <div>
                <div style={{fontweight: '600', marginBottom: '10px', fontFamily:'var(--mono)', fontSize: '16px'}}>
                  {studyMode ? 'On' : 'Off'}
                </div>

                <div style = {{fontFamily: 'var(--mono)', fontSize: '13px'}}>
                  {studyMode? 'Off-topic messages trigger the desi parent persona.':'Chat about anything. No enforcement.'}
                </div>
              </div>

              <button
                onClick={toggleStudyMode}
                className={`toggle-btn ${studyMode ? 'on' : ''}`}
              >
                <span className="toggle-circle" />
              </button>

            </div>
          </div>
        </div>
      )}

      {settings && (
        <div>

          <h2 style = {{fontFamily: 'var(--mono)', fontSize: '20px', marginBottom: '10px'}}>
            Persona
          </h2>


          <div className="persona-grid">

            {PERSONAS.map(persona => {
              const active = settings.active_persona === persona.id
              const loading = switchingPersona === persona.id

              return (
                <button
                  key={persona.id}
                  onClick={() => !active && !loading && switchPersona(persona.id)}
                  className={`persona-card ${active ? 'active' : ''}`}
                >

                  

                    <span style ={{fontSize: '16px', fontWeight: '600', color:'var(--text)', marginBottom: '20px'}}>
                      {persona.label}
                    </span>

                    {active && (
                      <span style = {{fontSize: '14px',fontFamily: 'var(--mono)',color: 'var(--accent)', display:'block', marginTop: '12px'}}>
                        ACTIVE
                      </span>
                    )}

                  <div style = {{fontSize: '14px',fontFamily: 'var(--mono)',color: 'var(--text)', marginTop: '10px', lineHeight: '1.5'}}>
                    {persona.desc}
                  </div>

                </button>
              )
            })}

          </div>

        </div>
      )}

    </div>
  )
}