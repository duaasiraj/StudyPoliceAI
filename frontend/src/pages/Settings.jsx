import {useState, useEffect} from 'react'

const PERSONAS = [
  {id: 'academic_advisor', icon: '🎓', label: 'Academic Advisor',desc: 'Calm, structured, evidence-based study guidance'},
  {id: 'crisis_planner', icon: '🚨', label: 'Crisis Planner', desc: 'Emergency mode — tight deadlines, no fluff'},
  {id: 'desi_parent',icon: '👨‍👩‍👧', label: 'Desi Parent', desc: 'Beta, padhai karo. Motivating but guilt-laden'},
  {id: 'roast_engine',icon: '🔥', label: 'Roast Engine', desc: 'Brutal honesty. Off-topic = roasted'},
]

export default function Settings(){


    const [settings, setSettings] = useState(null)
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [togglingStudyMode, setTogglingStudyMode] = useState(false)
    const [switchingPersona, setSwitchingPersona] = useState(null)


    const load = async() => {

        setLoading(true)

        try{

            const [sRes, stRes] = await Promise.all([
                fetch('http://localhost:8000/api/settings/'),
                fetch('http://localhost:8000/api/session/student'),
            ])
            setSettings(await sRes.json())
            setStudent(await stRes.json())

        }catch {
            setError('Could not load settings')

        }finally{
            setLoading(false)
        }

    }


    useEffect(() => {load()}, [])


    const toggleStudyMode = async() =>{

        setTogglingStudyMode(true)
        try{

            const res = await fetch('http://localhost:8000/api/settings/study-mode', { method: 'PATCH' })
            const data = await res.json()
            setSettings(s => ({ ...s, study_mode: data.study_mode }))

        }catch {
            setError('Could not switch persona')

        }finally{
            setTogglingStudyMode(false)
        }

    }


    const switchPersona = async (persona) => {
    setSwitchingPersona(persona)
        try {
            const res = await fetch(`http://localhost:8000/api/settings/persona?persona=${persona}`, { method: 'PATCH' })
            const data = await res.json()
            setSettings(s => ({ ...s, active_persona: data.active_persona }))
        }catch{ 
            setError('Could not switch persona') 
        }finally{
             setSwitchingPersona(null) 
            }
    }

    if (loading){
        return <div className="page"><div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '40px' }}><div className="spinner" /><span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Loading settings...</span></div></div>
    }


    return(

        <div className="page fade-up">

            <div className="page-header">
                <div className="page-title">Settings</div>
                <div className="page-subtitle">// session configuration & persona selection</div>
            </div>


            {error && <div className="error-banner" style={{ marginBottom: '20px' }}>{error}</div>}


            {student && (
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', marginBottom: '12px' }}>◆ Student Profile</div>
                    <div className="card" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', borderColor: 'var(--accent-border)' }}>
                        {[
                        { label: 'NAME', value: student.name },
                        { label: 'STUDENT ID', value: student.student_id },
                        { label: 'SEMESTER', value: `Semester ${student.semester}` },
                        { label: 'CGPA', value: student.cgpa.toFixed(2) },
                        ].map(f => (
                        <div key={f.label}>
                            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', marginBottom: '4px', letterSpacing: '0.08em' }}>{f.label}</div>
                            <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '15px', fontFamily: f.label === 'CGPA' ? 'var(--mono)' : undefined }}>{f.value}</div>
                        </div>
                        ))}
                    </div>
                </div>
            )}


            {settings && (
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', marginBottom: '12px' }}>◆ Study Mode</div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '15px', marginBottom: '4px' }}>
                                {settings.study_mode ? '📚 Study Mode is ON' : '😴 Study Mode is OFF'}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                                {settings.study_mode
                                    ? 'Off-topic messages will trigger the Roast Engine. Stay focused.'
                                    : 'Chat freely. No enforcement active.'}
                                </div>
                            </div>
                            <button
                                className={`toggle${settings.study_mode ? ' on' : ''}`}
                                onClick={!togglingStudyMode ? toggleStudyMode : undefined}
                                style={{ opacity: togglingStudyMode ? 0.5 : 1 }}
                            />
                        </div>
                        <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg3)', borderRadius: '6px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)' }}>
                        Preferred study window: {settings.preferred_study_window?.start_time} → {settings.preferred_study_window?.end_time} · {settings.session_length_minutes}min sessions
                        </div>
                    </div>
                </div>
            )}

            
            {settings && (
                <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', marginBottom: '12px' }}>◆ Active Persona</div>
                    <div className="card-grid card-grid-2">
                        {PERSONAS.map(p => {
                        const isActive = settings.active_persona === p.id
                        const isLoading = switchingPersona === p.id
                        return (
                            <div
                            key={p.id}
                            className="card"
                            style={{
                                cursor: 'pointer',
                                borderColor: isActive ? 'var(--accent-border)' : 'var(--border)',
                                background: isActive ? 'var(--accent-bg)' : 'var(--bg2)',
                                transition: 'all 0.15s',
                                opacity: isLoading ? 0.7 : 1,
                            }}
                            onClick={() => !isLoading && !isActive && switchPersona(p.id)}
                            >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '28px' }}>{p.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '14px', marginBottom: '4px' }}>{p.label}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{p.desc}</div>
                                </div>
                                </div>
                                {isActive && <span className="badge badge-red">ACTIVE</span>}
                                {isLoading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
                            </div>
                            </div>
                        )
                        })}
                    </div>
                </div>
            )}








        </div>
    )

}
