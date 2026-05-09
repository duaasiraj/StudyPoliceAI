import { useState, useEffect } from 'react'


const PERSONA_LABELS = {
  academic_advisor:{label: 'Academic Advisor',color: 'badge-blue'},
  crisis_planner:{label: 'Crisis Planner',color: 'badge-yellow'},
  desi_parent: {label: 'Desi Parent',color: 'badge-purple'},
  roast_engine: {label: 'Roast Engine 🔥',color: 'badge-red'},
}


function RiskCard({course}){

    const gap = course.target_gpa - course.current_gpa
    const risk = gap > 0.8 ? 'high' : gap > 0.3 ? 'medium' : 'low'
    const riskColor = {high: 'badge-red', medium: 'badge-yellow', low: 'badge-green'}[risk]
    const barPct = Math.min(100, (course.current_gpa / 4) * 100)
    const diffColor = {hard: 'badge-red', medium: 'badge-yellow', easy: 'badge-green'}[course.difficulty]

    return(

        <div className="card" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                <div style={{fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text)', marginBottom: '3px'}}>{course.course_id}</div>
                <div style={{fontWeight: 700, color: 'var(--heading)', fontSize: '14px', lineHeight: 1.3}}>{course.name}</div>
                </div>
                <span className={`badge ${riskColor}`}>{risk} risk</span>
            </div>

            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                <span className={`badge ${diffColor}`}>{course.difficulty}</span>
                <span className="badge badge-muted">{course.credit_hours} cr</span>
            </div>

            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--mono)', marginBottom: '6px' }}>
                    <span style={{color: 'var(--text)' }}>Current GPA</span>
                    <span style={{color: 'var(--heading)' }}>{course.current_gpa}<span style={{ color: 'var(--text)' }}>/ {course.target_gpa} target</span></span>
                </div>
                    <div style={{ height: '5px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barPct}%`, background: risk === 'high' ? 'var(--accent)' : risk === 'medium' ? 'var(--yellow)' : 'var(--green)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>
            </div>


        </div>

    )

}

export default function Dashboard(){


    const [student, setStudent] = useState(null)
    const [courses, setCourses] = useState([])
    const [assessments, setAssessments] = useState([])
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        Promise.all([
        fetch('http://localhost:8000/api/session/student').then(r => r.json()),
        fetch('http://localhost:8000/api/session/courses').then(r => r.json()),
        fetch('http://localhost:8000/api/assessments/').then(r => r.json()),
        fetch('http://localhost:8000/api/settings/').then(r => r.json()),
        ]).then(([s, c, a, st]) => {
        setStudent(s); setCourses(c); setAssessments(a); setSettings(st)
        }).catch(() => setError('Could not load dashboard data'))
        .finally(() => setLoading(false))
    }, [])


    const upcoming = assessments.filter(a => !a.completed).slice(0, 5)
    const persona = settings ? PERSONA_LABELS[settings.active_persona] : null

    if (loading){
        return <div className="page"><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '40px' }}><div className="spinner" /><span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Loading dashboard...</span></div></div>
    }
    
    if (error){
        return <div className="page"><div className="error-banner">{error}</div></div>
    }

    return(

        <div className="page fade-up">

            <div className="page-header">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'}}>
                <div>
                    <div className="page-title">Dashboard</div>
                    <div className="page-subtitle">academic status overview</div>
                </div>
                {persona && <span className={`badge ${persona.color}`}>{persona.label}</span>}
                </div>
            </div>



            {student && (

                <div className="card-grid card-grid-3 mb-16" style={{ marginBottom: '20px' }}>
                    
                    <div className="card" style={{ borderColor: 'var(--accent-border)' }}>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text)', marginBottom: '6px' }}>STUDENT</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--heading)' }}>{student.name}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)', marginTop: '4px' }}>{student.student_id} || Sem {student.semester}</div>
                    </div>


                    <div className="card">
                        <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text)', marginBottom: '6px' }}>CGPA</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: student.cgpa >= 3.5 ? 'var(--green)' : student.cgpa >= 2.5 ? 'var(--yellow)' : 'var(--accent)', fontFamily: 'var(--mono)' }}>
                            {student.cgpa.toFixed(2)}
                            </div>
                        <div style={{ fontSize: '11px', color: 'var(--text)' }}>{student.cgpa >= 3.5 ? '🎯 Looking good' : student.cgpa >= 2.5 ? '⚠️ Could be better' : '🚨 Critical zone'}</div>
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text)', marginBottom: '6px' }}>COURSES</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--heading)', fontFamily: 'var(--mono)' }}>{courses.length}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text)' }}>{assessments.filter(a => !a.completed).length} pending assessments</div>
                    </div>


                </div>

            )}


            <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--heading)', marginBottom: '12px', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Course Risk Analysis
                </div>
                <div className="card-grid card-grid-3">
                    {courses.map(c => <RiskCard key={c.course_id} course={c} />)}
                </div>
            </div>


            <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--heading)', marginBottom: '12px', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Upcoming Deadlines
                </div>
                {upcoming.length === 0 ? (
                    <div className="card"><span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '13px' }}>No pending assessments</span></div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {upcoming.map(a => {
                        const daysLeft = Math.ceil((new Date(a.due_date) - new Date())/86400000)

                        const urgency = daysLeft <= 2 ? 'badge-red' : daysLeft <= 5 ? 'badge-yellow' : 'badge-green'

                        const typeColor = {exam: 'badge-red', assignment: 'badge-blue', project: 'badge-purple'}[a.type] || 'badge-muted'

                        return (
                            <div key={a.assessment_id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--heading)', fontSize: '14px' }}>{a.title}</div>
                                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)', marginTop: '3px' }}>{a.course_id} · {a.estimated_hours}h estimated · {a.weightage}% weight</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className={`badge ${typeColor}`}>{a.type}</span>
                                    <span className={`badge ${urgency}`}>{daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d left`}</span>
                                </div>
                            </div>
                        )
                        })}
                    </div>
                )}
            </div>




        </div>



    )


}