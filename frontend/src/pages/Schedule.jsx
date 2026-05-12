import { useState, useEffect } from 'react'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function firstWeekday(year, month) { return new Date(year, month, 1).getDay() }

const TYPE_STYLE = {
  exam:       { bg: 'rgba(255,77,109,0.18)',  border: 'rgba(255,77,109,0.5)',  text: '#ff8fa3', dot: '#ff4d6d' },
  assignment: { bg: 'rgba(77,159,255,0.18)',  border: 'rgba(77,159,255,0.5)',  text: '#7db8ff', dot: '#4d9fff' },
  project:    { bg: 'rgba(168,85,247,0.18)',  border: 'rgba(168,85,247,0.5)',  text: '#c084fc', dot: '#a855f7' },
  quiz:       { bg: 'rgba(255,214,10,0.18)',  border: 'rgba(255,214,10,0.5)',  text: '#ffd60a', dot: '#ffd60a' },
}
const fallback = { bg: 'rgba(0,229,160,0.1)', border: 'rgba(0,229,160,0.3)', text: '#00e5a0', dot: '#00e5a0' }

function ts(type) { return TYPE_STYLE[type] || fallback }

function Pill({ slot }) {
  const s = ts(slot.type)
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={e => { setHovered(true); setPos({ x: e.clientX, y: e.clientY }) }}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
    >
      <div style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '10px',
        color: s.text,
        fontFamily: 'var(--mono)',
        cursor: 'default',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.5,
      }}>
        {slot.start_time} {slot.title.replace('Study: ', '').split(' ').slice(0, 3).join(' ')}
      </div>

      {hovered && (
        <div style={{
          position: 'fixed',
          left: pos.x + 12,
          top: pos.y + 12,
          zIndex: 9999,
          width: '220px',
          background: 'var(--bg)',
          border: `1px solid ${s.border}`,
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: s.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {slot.type || 'study'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--heading)', lineHeight: 1.4 }}>
            {slot.title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
            {slot.course_id}<br />
            {slot.start_time} → {slot.end_time}<br />
            {slot.due_date ? `Due: ${slot.due_date}` : ''}
          </div>
          {slot.priority_score !== undefined && (
            <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '2px' }}>
              Priority score: <span style={{ color: s.text }}>{slot.priority_score}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Schedule() {
  const today     = new Date()
  const thisYear  = today.getFullYear()
  const thisMonth = today.getMonth()
  const todayDate = today.getDate()

  const [schedule,   setSchedule]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error,      setError]      = useState(null)

  const byDate = schedule.reduce((acc, slot) => {
    const d = slot.date
    if (!acc[d]) acc[d] = []
    acc[d].push(slot)
    return acc
  }, {})

  const loadSchedule = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/api/scheduler/')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSchedule(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSchedule() }, [])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/api/scheduler/generate', { method: 'POST' })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setSchedule(Array.isArray(data.schedule) ? data.schedule : [])
    } catch (e) {
      setError(e.message || 'Could not generate schedule')
    } finally {
      setGenerating(false)
    }
  }

  const totalDays  = daysInMonth(thisYear, thisMonth)
  const startDay   = firstWeekday(thisYear, thisMonth)
  const cells      = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const totalSessions  = schedule.length
  const uniqueDays     = Object.keys(byDate).length
  const taskCount      = [...new Set(schedule.map(s => s.assessment_id))].length

  return (
    <div className="page fade-up" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="page-title">Study Schedule</div>
            <div className="page-subtitle">// {MONTH_NAMES[thisMonth]} {thisYear} · AI-generated via CSP + A*</div>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={generating || loading}>
            {generating ? (
              <>
                <div className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px', borderTopColor: '#fff' }} />
                Generating...
              </>
            ) : '⚡ Generate'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '16px' }}>{error}</div>}

      {totalSessions > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Sessions scheduled', value: totalSessions },
            { label: 'Study days', value: uniqueDays },
            { label: 'Tasks covered', value: taskCount },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '12px 16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 700, color: 'var(--heading)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '60px 0', justifyContent: 'center' }}>
          <div className="spinner" />
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Loading schedule...</span>
        </div>
      ) : schedule.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <div className="empty-title">No schedule yet</div>
          <div className="empty-sub">Hit Generate to build your study plan using CSP + A* based on your calendar free slots and assessments.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 0' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {cells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} style={{ height: '120px' }} />

              const slots   = byDate[day] || []
              const isToday = day === todayDate
              const isPast  = day < todayDate
              const MAX_SHOW = 3
              const overflow = slots.length - MAX_SHOW

              return (
                <div
                  key={day}
                  style={{
                    height: '120px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: isToday ? 'rgba(255,77,109,0.06)' : isPast ? 'rgba(255,255,255,0.015)' : 'var(--bg2)',
                    border: isToday ? '1px solid rgba(255,77,109,0.4)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '7px 6px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    opacity: isPast && !slots.length ? 0.3 : 1,
                    transition: 'border-color 0.12s',
                  }}
                >
                  <div style={{
                    fontSize: '11px', fontFamily: 'var(--mono)',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--accent)' : isPast ? 'var(--text)' : 'var(--text2)',
                    marginBottom: '3px',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    {day}
                    {isToday && (
                      <span style={{ fontSize: '8px', background: 'var(--accent)', color: '#fff', borderRadius: '3px', padding: '1px 4px', fontWeight: 700, lineHeight: 1.4 }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {slots.slice(0, MAX_SHOW).map((slot, si) => (
                    <Pill key={si} slot={slot} />
                  ))}

                  {overflow > 0 && (
                    <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', paddingLeft: '3px' }}>
                      +{overflow} more
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(TYPE_STYLE).map(([type, s]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: s.text, textTransform: 'capitalize' }}>{type}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}