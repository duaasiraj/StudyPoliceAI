import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [student, setStudent]= useState(null)
  const [courses, setCourses]= useState([])
  const [assessments, setAssessments] = useState([])
  const [settings, setSettings]= useState(null)
  const [loading, setLoading]= useState(true)
  const [error, setError]= useState(null)

  useEffect(() => {
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

  const pending = assessments.filter(a => !a.completed)
  const upcoming = pending.slice(0, 5)

  return (
    <div style={{padding: '36px', maxWidth: '900px'}}>

      <h1 style={{ fontFamily: 'var(--heading-font)', fontSize: '30px', marginBottom: '4px' }}>Dashboard</h1>

      
      {student && (
        <div style={{marginBottom: '32px'}}>

          <h2 style={{fontFamily: 'var(--mono)', fontSize: '16px', marginBottom: '10px'}}>Account</h2>

          <div className="card account-grid" style = {{gap: '80px'}}>

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
              <span className="account-item-value">Semester {student.semester}</span>
            </div>

            <div className="account-item">
              <span className="account-item-label">CGPA</span>
              <span className="account-item-value">{student.cgpa.toFixed(2)}</span>
            </div>

            <div className="account-item">
              <span className="account-item-label">Pending</span>
              <span className="account-item-value">{pending.length} assessments</span>
            </div>

            <div className="account-item">
              <span className="account-item-label">Courses</span>
              <span className="account-item-value">{courses.length}</span>
            </div>

          </div>

        </div>
      )}

      

      <div style={{marginBottom: '32px'}}>

        <h2 style={{fontFamily: 'var(--mono)', fontSize: '16px', marginBottom: '10px'}}>Course Risk</h2>

        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>

          {courses.map(c => {
            const gap = c.target_gpa - c.current_gpa
            const risk = gap > 0.8 ? 'High' : gap > 0.3 ? 'Medium' : 'Low'
            const pct = Math.min(100, (c.current_gpa / 4) * 100)
            const barColor = risk === 'High' ? '#ff4d6d' : risk === 'Medium' ? '#ffd60a' : '#00e5a0'

            return (
              <div key={c.course_id} className="card" style={{display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>

                <div style={{minWidth: '140px'}}>

                  <div style={{fontFamily: 'var(--mono)',fontSize:'11px', color:'#8b93a7'}}>{c.course_id}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.name}</div>

                </div>

                <div style={{flex: 1, minWidth: '140px'}}>

                  <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '11px', color: '#8b93a7', marginBottom: '4px'}}>
                    
                    <span>GPA: {c.current_gpa}</span>
                    <span>Target: {c.target_gpa}</span>

                  </div>

                  <div style={{height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: barColor, borderRadius: '99px'}} />
                  </div>

                </div>

                <div style={{display: 'flex', gap: '8px', fontFamily: 'var(--mono)', fontSize: '11px'}}>
                  <span style={{padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: '#8b93a7'}}>{c.difficulty}</span>
                  <span style={{padding: '2px 8px', borderRadius: '4px', border: `1px solid ${barColor}44`, color: barColor}}>{risk} risk</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>


      <div>

        <h2 style={{fontFamily: 'var(--mono)', fontSize: '16px', marginBottom: '10px'}}>Upcoming Deadlines</h2>
        
        {upcoming.length === 0 ? (

          <div className="card" style={{ color: '#8b93a7', fontFamily: 'var(--mono)', fontSize: '13px' }}>
            No pending assessments.
          </div>

        ) : (

          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>

            {upcoming.map(a => {
              const daysLeft = Math.ceil((new Date(a.due_date) - new Date())/86400000)
              const urgencyColor = daysLeft <= 2 ? '#ff4d6d' : daysLeft <= 5 ? '#ffd60a' : '#8b93a7'

              return (
                <div key={a.assessment_id} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap'}}>

                  <div>

                    <div style={{fontWeight: 600, fontSize: '14px' }}>{a.title}</div>
                    <div style={{fontFamily: 'var(--mono)', fontSize: '11px', color: '#8b93a7', marginTop: '3px'}}>
                      {a.course_id} {a.type} {a.weightage}%
                    </div>

                  </div>

                  <div style={{fontFamily: 'var(--mono)', fontSize: '12px', color: urgencyColor, flexShrink: 0}}>
                    {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d left`}
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