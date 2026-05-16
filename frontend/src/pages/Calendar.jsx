import { useState, useEffect, useRef } from 'react'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function firstWeekday(year, month) { return new Date(year, month, 1).getDay() }

const BUILTIN_TYPES = {
  class:    { bg: 'rgba(77,159,255,0.12)',  border: 'rgba(77,159,255,0.35)',  dot: '#4d9fff',  text: '#7db8ff'  },
  lab:      { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.35)',  dot: '#a855f7',  text: '#c084fc'  },
  personal: { bg: 'rgba(255,214,10,0.12)',  border: 'rgba(255,214,10,0.35)',  dot: '#ffd60a',  text: '#ffd60a'  },
  sleep:    { bg: 'rgba(150,150,180,0.08)', border: 'rgba(150,150,180,0.2)', dot: '#6b6b8a',  text: '#9898b0'  },
}

const fallback = BUILTIN_TYPES.personal

const EMPTY_FORM = { label: '', date: '', start_time: '', end_time: '', type: 'class', recurring: false }

function getTypeStyle(type, customTypes) {
  if (BUILTIN_TYPES[type]) return BUILTIN_TYPES[type]
  const ct = customTypes.find(c => c.value === type)
  return ct ? ct.style : fallback
}

// Parse a block's date to { year, month (0-based), day }
function parseBlockDate(dateStr) {
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return { year: y, month: m - 1, day: d }
  }
  // legacy int (day-of-month only) — we can't know the year/month, treat as day-only
  return { year: null, month: null, day: Number(dateStr) }
}

function BlockPill({ block, customTypes }) {
  const s = getTypeStyle(block.type, customTypes)
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: '4px',
      padding: '2px 5px', fontSize: '10px', color: s.text,
      fontFamily: 'var(--mono)', whiteSpace: 'nowrap',
      overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', lineHeight: 1.4,
    }}>
      {block.start_time} {block.label}
    </div>
  )
}

function DayModal({ day, month, year, blocks, customTypes, onClose, onDelete, onAddBlock, onClearDay }) {
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => { onClose(); onAddBlock(day) }}
            >
              + Add Block
            </button>
            {blocks.some(b => !b.recurring) && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onClearDay(day)}
              >
                Clear Day
              </button>
            )}
            <button className="btn btn-sm" onClick={onClose} style={{ padding: '5px 10px' }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text)', fontSize: '13px' }}>
              No blocks scheduled for this day.
            </div>
          ) : (
            blocks.map((b, i) => {
              const s = getTypeStyle(b.type, customTypes)
              return (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  padding: '12px', borderRadius: '8px',
                  background: s.bg, border: `1px solid ${s.border}`,
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot, marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: s.text, marginBottom: '2px' }}>
                      {b.start_time} – {b.end_time}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--heading)', fontWeight: 600 }}>{b.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'capitalize', marginTop: '3px' }}>
                      {b.type}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    style={{ padding: '3px 9px', fontSize: '11px', flexShrink: 0 }}
                    onClick={() => onDelete(b.block_id)}
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// Build year options: current year ± 2
function buildYearOptions(thisYear) {
  const years = []
  for (let y = thisYear - 1; y <= thisYear + 2; y++) years.push(y)
  return years
}

export default function Calendar() {
  const today     = new Date()
  const thisYear  = today.getFullYear()
  const thisMonth = today.getMonth()
  const todayDate = today.getDate()

  // Viewed month/year — default to current
  const [viewYear,  setViewYear]  = useState(thisYear)
  const [viewMonth, setViewMonth] = useState(thisMonth)

  const [blocks,      setBlocks]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [modalDay,    setModalDay]    = useState(null)
  const [customTypes] = useState([])
  const [timeError, setTimeError] = useState(null)

  const totalDays = daysInMonth(viewYear, viewMonth)
  const startDay  = firstWeekday(viewYear, viewMonth)
  const cells     = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const isCurrentMonth = viewYear === thisYear && viewMonth === thisMonth

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/api/session/calendar')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBlocks(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load calendar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const addBlock = async (e) => {
    e.preventDefault()
    setTimeError(null)

    // Time validation
    if (!form.start_time) {
      setTimeError('Please set a start time first.')
      return
    }
    if (!form.end_time) {
      setTimeError('Please set an end time.')
      return
    }
    if (form.end_time <= form.start_time) {
      setTimeError(`End time must be after start time (${form.start_time}).`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // Build full date string from the day number + viewed month/year
      const dayNum = Number(form.date) || (isCurrentMonth ? todayDate : 1)
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
      const res = await fetch('http://localhost:8000/api/calendar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: dateStr,
          recurring: Boolean(form.recurring),
        }),
      })
      if (!res.ok) throw new Error()
      setForm(EMPTY_FORM)
      setShowForm(false)
      setTimeError(null)
      await load()
    } catch {
      setError('Could not add block')
    } finally {
      setSubmitting(false)
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this block?')) return
    try {
      const res = await fetch(`http://localhost:8000/api/calendar/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setBlocks(prev => prev.filter(b => b.block_id !== id))
    } catch {
      setError('Could not delete block')
    }
  }

  // Returns blocks that apply to a given day number in the viewed month/year
  const getBlocksForDay = (day) => {
    return blocks
      .filter(b => {
        if (b.recurring) return true
        const parsed = parseBlockDate(b.date)
        if (parsed.year !== null) {
          // Full date: must match viewed year and month exactly
          return parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day
        }
        // Legacy int date (day-only): match day number only
        return parsed.day === day
      })
      .filter(b => filter === 'all' || b.type === filter)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Count blocks that belong to the viewed month (for the header)
  const blocksThisMonth = blocks.filter(b => {
    if (b.recurring) return true
    const parsed = parseBlockDate(b.date)
    if (parsed.year !== null) return parsed.year === viewYear && parsed.month === viewMonth
    return true // legacy day-only blocks shown everywhere
  })

  const openModalForDay = (day) => {
    // Mirror getBlocksForDay exactly (recurring = show on every day, non-recurring = exact date match)
    // Always open the modal — even empty days show the modal with an "+ Add Block" option
    setModalDay(day)
  }

  const openFormForDay = (day) => {
    setForm({ ...EMPTY_FORM, date: String(day) })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleModalDelete = async (id) => {
    await del(id)
    setModalDay(prev => {
      const remaining = blocks.filter(b => b.block_id !== id)
      const stillHasBlocks = remaining.some(b => {
        if (b.recurring) return true
        const parsed = parseBlockDate(b.date)
        if (parsed.year !== null) return parsed.year === viewYear && parsed.month === viewMonth && parsed.day === prev
        return parsed.day === prev
      })
      return stillHasBlocks ? prev : null
    })
  }

  // Clear non-recurring blocks for a specific day only.
  // Recurring blocks are intentionally excluded — deleting a recurring block removes it
  // from every week, not just this day. Use the individual ✕ button to remove a recurring block.
  const clearDay = async (day) => {
    const toDelete = blocks.filter(b => {
      if (b.recurring) return false  // never bulk-delete recurring blocks
      const parsed = parseBlockDate(b.date)
      if (parsed.year !== null) return parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day
      return parsed.day === day
    })
    if (toDelete.length === 0) {
      alert('No one-off blocks on this day to clear. To remove a recurring block, use the ✕ button next to it.')
      return
    }
    if (!confirm(`Clear ${toDelete.length} one-off block(s) for ${MONTH_NAMES[viewMonth]} ${String(day).padStart(2,'0')}? Recurring blocks will not be affected.`)) return
    setError(null)
    try {
      // Delete sequentially to avoid race on duplicate block_ids in session
      for (const b of toDelete) {
        await fetch(`http://localhost:8000/api/calendar/${b.block_id}`, { method: 'DELETE' })
      }
      // Reload from server so state exactly mirrors Session.json
      const res = await fetch('http://localhost:8000/api/session/calendar')
      const data = await res.json()
      setBlocks(Array.isArray(data) ? data : [])
      setModalDay(null)
    } catch {
      setError('Could not clear day')
    }
  }

  // Clear ALL blocks for the viewed month (recurring and non-recurring)
  const clearMonth = async () => {
    // For recurring: match by month+day (same logic as display)
    // For non-recurring: match by full year+month
    const toDelete = blocks.filter(b => {
      if (b.recurring) return false  // never bulk-delete recurring blocks
      const parsed = parseBlockDate(b.date)
      if (parsed.year !== null) return parsed.year === viewYear && parsed.month === viewMonth
      return false
    })
    if (toDelete.length === 0) return
    if (!confirm(`Clear ${toDelete.length} one-off block(s) for ${MONTH_NAMES[viewMonth]} ${viewYear}? Recurring blocks will not be affected.`)) return
    setError(null)
    try {
      // Delete sequentially to avoid race on duplicate block_ids in session
      for (const b of toDelete) {
        await fetch(`http://localhost:8000/api/calendar/${b.block_id}`, { method: 'DELETE' })
      }
      // Reload from server so state exactly mirrors Session.json
      const res = await fetch('http://localhost:8000/api/session/calendar')
      const data = await res.json()
      setBlocks(Array.isArray(data) ? data : [])
      setModalDay(null)
    } catch {
      setError('Could not clear month')
    }
  }

  const allTypeKeys = ['all', ...Object.keys(BUILTIN_TYPES)]
  const yearOptions = buildYearOptions(thisYear)

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

  return (
    <div className="page fade-up" style={{ maxWidth: '100%', padding: '60px 36px 36px' }}>
      {modalDay !== null && (
        <DayModal
          day={modalDay}
          month={viewMonth}
          year={viewYear}
          blocks={getBlocksForDay(modalDay)}
          customTypes={customTypes}
          onClose={() => setModalDay(null)}
          onDelete={handleModalDelete}
          onAddBlock={openFormForDay}
          onClearDay={clearDay}
        />
      )}

      {/* ── Header row: title left, actions right ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <h1 style={{ fontFamily: 'var(--heading-font)', fontSize: '30px', margin: 0, lineHeight: 1.1 }}>Calendar</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-sm btn-primary" onClick={() => { setShowForm(s => { if (s) { setTimeError(null); setForm(EMPTY_FORM) } return !s }); }}>
            {showForm ? '✕ Cancel' : '+ Add Block'}
          </button>
          {blocksThisMonth.length > 0 && (
            <button className="btn btn-sm btn-danger" onClick={clearMonth}>Clear Month</button>
          )}
        </div>
      </div>

   

      {/* ── Nav row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', marginTop: '32px' }}>
        <button className="btn btn-sm" onClick={goToPrevMonth} title="Previous month" style={{ padding: '5px 9px' }}>‹</button>

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

        <button className="btn btn-sm" onClick={goToNextMonth} title="Next month" style={{ padding: '5px 9px' }}>›</button>

        {!isCurrentMonth && (
          <button className="btn btn-sm" onClick={() => { setViewYear(thisYear); setViewMonth(thisMonth); setModalDay(null) }}>
            Today
          </button>
        )}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '12px' }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--accent-border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text)', marginBottom: '14px' }}>◆ New Block</div>
          <form onSubmit={addBlock}>
            <div className="form-row form-grid-2" style={{ marginBottom: '12px' }}>
              <div className="form-field">
                <label className="form-label">Label</label>
                <input className="input" placeholder="e.g. AI Lecture" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="select"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ flex: 1 }}
                  >
                    <option value="class">Class</option>
                    <option value="lab">Lab</option>
                    <option value="personal">Personal</option>
                    <option value="sleep">Sleep</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="form-row form-grid-3" style={{ marginBottom: '12px' }}>
              <div className="form-field">
                <label className="form-label">Day of {MONTH_NAMES[viewMonth]}</label>
                <input className="input" type="number" min="1" max={totalDays} placeholder={isCurrentMonth ? String(todayDate) : '1'} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label className="form-label">Start</label>
                <input
                  className="input"
                  type="time"
                  value={form.start_time}
                  onChange={e => {
                    setTimeError(null)
                    setForm(f => ({ ...f, start_time: e.target.value, end_time: '' }))
                  }}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">End</label>
                <input
                  className="input"
                  type="time"
                  value={form.end_time}
                  min={form.start_time || undefined}
                  onChange={e => {
                    setTimeError(null)
                    if (!form.start_time) {
                      setTimeError('Please select a start time first.')
                      return
                    }
                    if (e.target.value && e.target.value <= form.start_time) {
                      setTimeError(`End time must be after start time (${form.start_time}).`)
                    }
                    setForm(f => ({ ...f, end_time: e.target.value }))
                  }}
                  required
                />
              </div>
            </div>
            {timeError && (
              <div style={{ marginBottom: '10px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,77,109,0.10)', border: '1px solid rgba(255,77,109,0.30)', color: '#ff4d6d', fontSize: '12px', fontFamily: 'var(--mono)' }}>
                ⚠ {timeError}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : '+ Add Block'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {allTypeKeys.map(f => {
          const ct = customTypes.find(c => c.value === f)
          const label = f === 'all' ? `All (${blocksThisMonth.length})` : ct ? ct.label : f
          return (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '60px 0', justifyContent: 'center' }}>
          <div className="spinner" />
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>Loading calendar...</span>
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
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} style={{ minHeight: '75px' }} />

              const dayBlocks = getBlocksForDay(day)
              const isToday   = isCurrentMonth && day === todayDate
              const isPast    = isCurrentMonth ? day < todayDate : viewYear < thisYear || (viewYear === thisYear && viewMonth < thisMonth)
              const MAX_SHOW  = 2
              const overflow  = dayBlocks.length - MAX_SHOW
              const hasBlocks = dayBlocks.length > 0

              return (
                <div
                  key={day}
                  onClick={() => openModalForDay(day)}
                  onMouseEnter={e => { if (hasBlocks && !isToday) e.currentTarget.style.borderColor = 'var(--border2)' }}
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
                    opacity: isPast && !hasBlocks ? 0.3 : 1,
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
                  {dayBlocks.slice(0, MAX_SHOW).map((b, bi) => (
                    <BlockPill key={bi} block={b} customTypes={customTypes} />
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

          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Legend</span>
            {Object.entries(BUILTIN_TYPES).map(([type, s]) => (
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