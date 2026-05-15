import {useState, useEffect} from 'react'

const EMPTY_FORM = {
  course_id: '',
  title: '',
  type: 'assignment',
  due_date: '',
  weightage: '',
  estimated_hours: ''
}

export default function Assessments() {
  const [assessments, setAssessments] = useState([])
  const [courses,setCourses] = useState([])
  const [loading,setLoading]= useState(true)
  const [submitting,setSubmitting]  = useState(false)
  const [error,setError]= useState(null)
  const [showForm,setShowForm]= useState(false)
  const [form,setForm]= useState(EMPTY_FORM)
  const [filter,setFilter]= useState('all')

  async function load() {

    setLoading(true)
    try {
      const [aRes, cRes] = await Promise.all([
        fetch('http://localhost:8000/api/session/assessments'),
        fetch('http://localhost:8000/api/session/courses'),
      ])

      setAssessments(await aRes.json())
      setCourses(await cRes.json())

    } catch {
      setError('Could not load assessments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e) {

    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:8000/api/assessments/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...form,
          weightage: Number(form.weightage),
          estimated_hours: Number(form.estimated_hours)
        })
      })
      if (!res.ok) throw new Error()
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch {
      setError('Could not add assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  async function complete(id) {
    try {

      await fetch(`http://localhost:8000/api/assessments/${id}/complete`, {method: 'PATCH'})

      setAssessments(prev => prev.map(a => a.assessment_id === id ? { ...a, completed: true} : a))
    }catch {
      setError('Could not mark as complete.')
    }
  }

  async function del(id) {
    if (!confirm('Delete this assessment?')) return
    try {
      await fetch(`http://localhost:8000/api/assessments/${id}`, {method: 'DELETE'})
      setAssessments(prev => prev.filter(a => a.assessment_id !== id))

    } catch {
      setError('Could not delete.')
    }
  }

  const pending = assessments.filter(a => !a.completed).length

  const filtered = filter === 'all'? assessments : filter === 'pending' ? assessments.filter(a => !a.completed) : assessments.filter(a =>  a.completed)

  return (
    <div style={{padding: '36px', maxWidth: '800px'}}>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>

        <h1 style={{ fontFamily: 'var(--heading-font)', fontSize: '30px' }}>Assessments</h1>

        <button className="btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>

      </div>

      <p style={{fontFamily: 'var(--mono)', fontSize: '13px', color: '#8b93a7', marginBottom: '32px', marginTop: '-10px'}}>
        {pending} pending || {assessments.length} total
      </p>

      {error && <div className="error-box" style={{marginBottom: '20px'}}>{error}</div>}

      
      {showForm && (
        <div className="card" style={{marginBottom: '24px'}}>

          <h2 style={{ fontFamily: 'var(--mono)', fontSize: '16px', marginBottom: '16px' }}>New Assessment</h2>

          <form onSubmit={submit}>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
              <div>

                <label className="account-item-label">Course</label>

                <select className="select" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>

                  <option value="">Select course...</option>

                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_id} — {c.name}</option>)}
                </select>

              </div>
              <div>
                <label className="account-item-label">Type</label>

                <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>

                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>

            <div style={{marginBottom: '12px', paddingRight: '15px'}}>

              <label className="account-item-label">Title</label>

              <input className="input" placeholder="e.g. Midterm Exam" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required/>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: '20px',paddingRight: '15px'}}>
              
              <div>
                <label className="account-item-label">Due Date</label>
                <input className="input" style={{width:'80%'}} type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
              </div>
              <div>
                <label className="account-item-label">Weightage (%)</label>
                <input className="input" style={{width:'80%'}} type="number" min="1" max="100" placeholder="10" value={form.weightage} onChange={e => setForm(f => ({ ...f, weightage: e.target.value }))} required />
              </div>
              <div>
                <label className="account-item-label">Est. Hours</label>
                <input className="input" style={{width:'80%'}} type="number" min="1" placeholder="4" value={form.estimated_hours} onChange={e => setForm(f => ({ ...f, estimated_hours: e.target.value }))} required />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : '+ Add Assessment'}
            </button>
          </form>
        </div>
      )}

      

      <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>

        {[
          { key: 'all',label: `All (${assessments.length})`},
          { key: 'pending', label: `Pending (${pending})`},
          { key: 'done',label: `Done (${assessments.length - pending})`},

        ].map(f => (
          <button
            key={f.key}
            className="btn"
            onClick={() => setFilter(f.key)}
            style={{ borderColor: filter === f.key ? 'var(--accent)' : 'var(--border)', color: filter === f.key ? 'var(--accent)' : 'var(--text)' }}
          >
            {f.label}
          </button>
        ))}
      </div>

    <div style={{minHeight: '300px'}}>
      {filtered.length === 0 ? (
        <div className="card" style={{color: '#8b93a7', fontFamily: 'var(--mono)', fontSize: '13px'}}>
          No Assessments Here!
        </div>

      ) : (

        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>

          {filtered.map(a => {

            const daysLeft = Math.ceil((new Date(a.due_date) - new Date())/86400000)
            const urgencyColor = a.completed ? '#00e5a0' : daysLeft <= 2 ? '#ff4d6d' : daysLeft <= 5 ? '#ffd60a' : '#8b93a7'

            return (

              <div key={a.assessment_id} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', opacity: a.completed ? 0.55 : 1}}>
                
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: 600, fontSize: '14px', textDecoration: a.completed ? 'line-through' : 'none'}}>
                    {a.title}
                  </div>

                  <div style={{fontFamily: 'var(--mono)', fontSize: '14px', color: '#8b93a7', marginTop: '3px'}}>
                    {a.course_id}  {a.type}  {a.due_date}  {a.estimated_hours}h  {a.weightage}%
                  </div>

                </div>

                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0}}>
                  <span style={{fontFamily: 'var(--mono)', fontSize: '11px', color: urgencyColor}}>
                    {a.completed ? 'Done' : daysLeft <= 0 ? 'Overdue' : `${daysLeft}d left`}
                  </span>

                  {!a.completed && (
                    <button className="btn" style={{fontSize: '12px', padding: '5px 10px'}} onClick={() => complete(a.assessment_id)}>
                      Mark done
                    </button>
                  )}
                  <button className="btn" style={{fontSize: '12px', padding: '5px 10px', color: '#ff8080', borderColor: 'rgba(255,80,80,0.25)' }} onClick={() => del(a.assessment_id)}>
                    Delete
                  </button>
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