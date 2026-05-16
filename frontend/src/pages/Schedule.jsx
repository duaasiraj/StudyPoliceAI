import { useState, useEffect, useRef } from 'react'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function firstWeekday(year, month) { return new Date(year, month, 1).getDay() }

const TYPE_STYLE = {
  exam:       { bg: 'rgba(255,77,109,0.12)',  border: 'rgba(255,77,109,0.4)',  text: '#ff8fa3', dot: '#ff4d6d' },
  assignment: { bg: 'rgba(77,159,255,0.12)',  border: 'rgba(77,159,255,0.35)', text: '#7db8ff', dot: '#4d9fff' },
  project:    { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.35)', text: '#c084fc', dot: '#a855f7' },
  quiz:       { bg: 'rgba(255,214,10,0.12)',  border: 'rgba(255,214,10,0.35)', text: '#ffd60a', dot: '#ffd60a' },
}
const fallback = { bg: 'rgba(0,229,160,0.10)', border: 'rgba(0,229,160,0.30)', text: '#00e5a0', dot: '#00e5a0' }

function ts(type) { return TYPE_STYLE[type] || fallback }

function buildYearOptions(thisYear) {
  const years = []
  for (let y = thisYear - 1; y <= thisYear + 2; y++) years.push(y)
  return years
}

function SlotPill({ slot }) {
  const s = ts(slot.type)
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: '4px',
      padding: '2px 5px', fontSize: '10px', color: s.text,
      fontFamily: 'var(--mono)', whiteSpace: 'nowrap',
      overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', lineHeight: 1.4,
    }}>
      {slot.start_time} {slot.title.replace('Study: ', '').split(' ').slice(0, 3).join(' ')}
    </div>
  )
}

function DayModal({ day, month, year, slots, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: '12px', width: '100%', maxWidth: '480px',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
              {MONTH_NAMES[month]} {year}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--heading)', fontFamily: 'var(--mono)' }}>
              {String(day).padStart(2, '0')}
            </div>
          </div>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '5px 10px' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text)', fontSize: '13px' }}>
              No sessions scheduled for this day.
            </div>
          ) : (
            slots.map((slot, i) => {
              const s = ts(slot.type)
              return (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '12px', borderRadius: '8px',
                  background: s.bg, border: `1px solid ${s.border}`,
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot, marginTop: '5px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: s.text, marginBottom: '2px' }}>
                      {slot.start_time} – {slot.end_time}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--heading)', fontWeight: 600, marginBottom: '3px' }}>
                      {slot.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
                      {slot.course_id && <span>{slot.course_id}<br /></span>}
                      <span style={{ textTransform: 'capitalize' }}>{slot.type || 'study'}</span>
                      {slot.due_date && <span><br />Due: {slot.due_date}</span>}
                    </div>
                    {slot.priority_score !== undefined && (
                      <div style={{ marginTop: '6px', fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                        Priority score: <span style={{ color: s.text }}>{slot.priority_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default function Schedule() {
  const today     = new Date()
  const thisYear  = today.getFullYear()
  const thisMonth = today.getMonth()
  const todayDate = today.getDate()

  const [viewYear,   setViewYear]   = useState(thisYear)
  const [viewMonth,  setViewMonth]  = useState(thisMonth)
  const [schedule,   setSchedule]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error,      setError]      = useState(null)
  const [modalDay,   setModalDay]   = useState(null)

  const isCurrentMonth = viewYear === thisYear && viewMonth === thisMonth

  const totalDays = daysInMonth(viewYear, viewMonth)
  const startDay  = firstWeekday(viewYear, viewMonth)
  const cells     = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const yearOptions = buildYearOptions(thisYear)

  const getSlotsForDay = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return schedule
      .filter(s => s.date === dateStr || String(s.date) === String(day))
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  }

  const sessionsThisMonth = schedule.filter(s => {
    if (typeof s.date === 'string' && s.date.includes('-')) {
      const [y, m] = s.date.split('-').map(Number)
      return y === viewYear && m === viewMonth + 1
    }
    return true
  })

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

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setModalDay(null)
  }
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setModalDay(null)
  }

  const totalSessions = sessionsThisMonth.length
  const uniqueDays    = [...new Set(sessionsThisMonth.map(s => s.date))].length
  const taskCount     = [...new Set(sessionsThisMonth.map(s => s.assessment_id))].length

  return (
    <div className="page fade-up" style={{ maxWidth: '100%', padding: '60px 36px 36px' }}>
      {modalDay !== null && (
        <DayModal
          day={modalDay}
          month={viewMonth}
          year={viewYear}
          slots={getSlotsForDay(modalDay)}
          onClose={() => setModalDay(null)}
        />
      )}

      {/* ── Header row: title left, actions right ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h1 style={{ fontFamily: 'var(--heading-font)', fontSize: '30px', margin: 0, lineHeight: 1.1 }}>Study Schedule</h1>
        <button className="btn btn-sm btn-primary" onClick={generate} disabled={generating || loading}>
          {generating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="spinner" style={{ width: '11px', height: '11px', borderWidth: '2px', borderTopColor: '#fff' }} />
              Generating...
            </span>
          ) : 'Generate'}
        </button>
      </div>

     
      

      {/* ── Nav row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' , marginTop: '32px'}}>
        <button className="btn btn-sm" onClick={goToPrevMonth} style={{ padding: '5px 9px' }}>‹</button>

        <select
          className="select"
          value={viewMonth}
          onChange={e => { setViewMonth(Number(e.target.value)); setModalDay(null) }}
          style={{ width: 'auto', padding: '5px 8px', fontSize: '13px' }}
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i}>{name}</option>
          ))}
        </select>

        <select
          className="select"
          value={viewYear}
          onChange={e => { setViewYear(Number(e.target.value)); setModalDay(null) }}
          style={{ width: 'auto', padding: '5px 8px', fontSize: '13px' }}
        >
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <button className="btn btn-sm" onClick={goToNextMonth} style={{ padding: '5px 9px' }}>›</button>

        {!isCurrentMonth && (
          <button className="btn btn-sm" onClick={() => { setViewYear(thisYear); setViewMonth(thisMonth); setModalDay(null) }}>
            Today
          </button>
        )}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '12px' }}>{error}</div>}

      {/* Stats row */}
      {totalSessions > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Sessions', value: totalSessions },
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
          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} style={{ minHeight: '75px' }} />

              const slots    = getSlotsForDay(day)
              const isToday  = isCurrentMonth && day === todayDate
              const isPast   = isCurrentMonth ? day < todayDate : viewYear < thisYear || (viewYear === thisYear && viewMonth < thisMonth)
              const MAX_SHOW = 2
              const overflow = slots.length - MAX_SHOW
              const hasSlots = slots.length > 0

              return (
                <div
                  key={day}
                  onClick={() => setModalDay(day)}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--border2)' }}
                  onMouseLeave={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--border)' }}
                  style={{
                    minHeight: '75px',
                    background: isToday ? 'rgba(255,77,109,0.06)' : isPast ? 'rgba(255,255,255,0.01)' : 'var(--bg2)',
                    border: isToday ? '1px solid rgba(255,77,109,0.4)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    transition: 'border-color 0.15s',
                    opacity: isPast && !hasSlots ? 0.3 : 1,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    fontSize: '11px', fontFamily: 'var(--mono)',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--accent)' : isPast ? 'var(--text)' : 'var(--text2)',
                    marginBottom: '2px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    {day}
                    {isToday && <span style={{ fontSize: '8px', background: 'var(--accent)', color: '#fff', borderRadius: '3px', padding: '1px 4px', fontWeight: 700 }}>TODAY</span>}
                  </div>

                  {slots.slice(0, MAX_SHOW).map((slot, si) => (
                    <SlotPill key={si} slot={slot} />
                  ))}

                  {overflow > 0 && (
                    <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', paddingLeft: '4px' }}>
                      +{overflow} more
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Legend</span>
            {Object.entries(TYPE_STYLE).map(([type, s]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: '6px' }}>
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