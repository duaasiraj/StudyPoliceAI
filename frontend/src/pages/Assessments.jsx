import {useState, useEffect} from 'react'

const empty_form = {

    course_id: '',
    title: '',
    type: 'assignment',
    due_date: '', 
    weightage: '',
    estimated_hours: ''
}

const TYPE_COLOR = { 
    exam: 'badge-red', 
    assignment: 'badge-blue', 
    project: 'badge-purple', 
    quiz: 'badge-yellow' 
}


export default function Assessments(){

    const [assessments, setAssessments] = useState([])
    const [courses, setCourses] = useState([])

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(empty_form)

    const [filter, setFilter] = useState('all')

    const load = async () =>{

            setLoading(true)
            try{

                const [assessmentResult, courseResult] = await Promise.all([
                fetch('http://localhost:8000/api/session/assessments'),
                fetch('http://localhost:8000/api/session/courses')
                ])
                setAssessments(await assessmentResult.json())
                setCourses(await courseResult.json())


            }catch{

                setError('Could not load assessments')

            }finally{
                setLoading(false)
            }
        }

    useEffect(()=>{

        load()

    }, [])


    const submit = async(e)=>{

        e.preventDefault()

        setSubmitting(true)
        setError(null)

        try{

            const data = {
                ...form,
                weightage: Number(form.weightage),
                estimated_hours: Number(form.estimated_hours)
            }


            const res = await fetch('http://localhost:8000/api/assessments',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
                }
            )

            if(!res.ok){
                throw new Error('Failed to add')
            }

            setForm(empty_form)
            setShowForm(false)
            await load()

        }catch{
            setError('Could not add assessment')
        }finally{
            setSubmitting(false)
        }

    }

    const complete = async(id)=>{

        try{    

            await fetch(`http://localhost:8000/api/assessments/${id}/complete`,{
                method: 'PATCH'
            })

            const updatedAssessment = assessments.map((assessment)=>{

                if(assessment.assessment_id === id){
                    return {...assessment, completed: true}
                }else{
                    return assessment
                }

            })

            setAssessments(updatedAssessment)

        }catch{
            setError('Could not mark assessment as complete')
        }
    }

    const del = async(id)=>{

        const userConfirmed = confirm('Delete this assessment?')
        if(!userConfirmed){
            return
        }


        try{    

            await fetch(`http://localhost:8000/api/assessments/${id}`,{
                method: 'DELETE'
            })

            const remaining = assessments.filter((assessment)=>{
                return assessment.assessment_id !== id
            })

            setAssessments(remaining)

        }catch{
            setError('Could not delete')
        }

    }

    let filtered

    if(filter==='all'){
        filtered = assessments
    }else if(filter==='pending'){
        filtered = assessments.filter((assessment)=>assessment.completed === false)
    }else{
        filtered = assessments.filter((assessment)=>assessment.completed === true)
    }

    const notCompleted = assessments.filter((assessment)=>{
        return assessment.completed ===false
    })

    const pending = notCompleted.length

    return(


        <div className='page fade-up'>
            {/* The banner */}
            <div className='page-header'>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'}}>

                    <div>
                        <div className='page-title'>ASSESSMENTS</div>    
                        <div className='page-subtitle'>{pending} pending || {assessments.length} total</div>
                    </div>

                    <button className='btn btn-primary' onClick={()=>setShowForm(s => !s)}>

                        {showForm ? 'X Cancel' : '+ Add Assessment'}

                    </button>
                
                </div>
            </div>

            {/* Any error banner */}

            {error && <div className="error-banner" style={{marginBottom: '16px'}}>{error}</div>}


            {/* New assessment form */}

            {showForm && (

                <div className="card" style={{marginBottom: '24px', borderColor: 'var(--accent-border)'}}>
                    <div style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: '16px', fontFamily: 'var(--mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        NEW ASSESSMENT
                    </div>

                    <form onSubmit={submit}>

                        <div className="form-row form-grid-2" style={{marginBottom: '12px'}}>
                            <div className="form-field">

                                <label className="form-label">Course</label>

                                <select className="select" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>

                                <option value="">Select course...</option>

                                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_id} — {c.name}</option>)}

                                </select>
                            </div>

                            <div className="form-field">
                                <label className="form-label">Type</label>
                                <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>

                                <option value="assignment">Assignment</option>
                                <option value="exam">Exam</option>
                                <option value="project">Project</option>
                                <option value="quiz">Quiz</option>
                                </select>
                            </div>

                        </div>

                        <div className="form-row" style={{ marginBottom: '12px' }}>
                            <div className="form-field">
                                <label className="form-label">Title</label>
                                <input className="input" placeholder="e.g. Midterm Exam" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="form-row form-grid-3" style={{ marginBottom: '20px' }}>
                            <div className="form-field">
                                <label className="form-label">Due Date</label>
                                <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Weightage (%)</label>
                                <input className="input" type="number" min="1" max="100" placeholder="10" value={form.weightage} onChange={e => setForm(f => ({ ...f, weightage: e.target.value }))} required />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Est. Hours</label>
                                <input className="input" type="number" min="1" placeholder="4" value={form.estimated_hours} onChange={e => setForm(f => ({ ...f, estimated_hours: e.target.value }))} required />
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                            {submitting ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#fff' }} /> Adding...</> : '+ Add Assessment'}
                        </button>

                    </form>
                </div>
            )}


            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['all', 'pending', 'done'].map(f => (

                <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? `All (${assessments.length})` : f === 'pending' ? `Pending (${pending})` : `Done (${assessments.length - pending})`}
                </button>

                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '40px 0' }}><div className="spinner" /><span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Loading...</span></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No assessments here</div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(a => {
                    const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / 86400000)
                    const urgency = a.completed ? 'badge-green' : daysLeft <= 2 ? 'badge-red' : daysLeft <= 5 ? 'badge-yellow' : 'badge-muted'
                    return (
                    <div key={a.assessment_id} className="card" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
                        opacity: a.completed ? 0.6 : 1,
                        borderColor: a.completed ? 'var(--border)' : undefined,
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: a.completed ? 'var(--text)' : 'var(--heading)', fontSize: '14px', textDecoration: a.completed ? 'line-through' : 'none' }}>
                            {a.title}
                            </span>
                            <span className={`badge ${TYPE_COLOR[a.type] || 'badge-muted'}`}>{a.type}</span>
                            {a.completed && <span className="badge badge-green">✓ Done</span>}
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)' }}>
                            {a.course_id} · Due {a.due_date} · {a.estimated_hours}h · {a.weightage}%
                        </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span className={`badge ${urgency}`}>{a.completed ? '✓' : daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d`}</span>
                        {!a.completed && (
                            <button className="btn btn-sm btn-success" onClick={() => complete(a.assessment_id)}>✓ Done</button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => del(a.assessment_id)}>✕</button>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}



        </div>
    )

} 

