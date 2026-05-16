import { useState, useEffect, useRef} from 'react'

const PERSONA_LABELS = {
  academic_advisor: 'Academic Advisor',
  crisis_planner: 'Crisis Planner',
  desi_parent: 'Desi Parent',
}

function Message({ msg }){

  const isUser = msg.role === 'user'

  return (

    <div style={{display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-start'}}>

      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
      }}>
        {isUser ? '🧍' : '🤖'}
      </div>

      <div style={{
        maxWidth: '72%', padding: '12px 16px', fontSize: '14px', lineHeight: 1.65,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        background: isUser ? 'rgba(124,140,255,0.08)' : 'var(--surface)',
        border: isUser ? '1px solid rgba(124,140,255,0.25)' : '1px solid var(--border)',
      }}>

        {msg.message}
        {msg.timestamp && (
          <div style={{fontFamily: 'var(--mono)', fontSize: '10px', color: '#8b93a7', marginTop: '6px'}}>

            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

      </div>

    </div>
  )
}

export default function Chat() {
  const [messages, setMessages]  = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [persona, setPersona] = useState(null)
  const [studyMode, setStudyMode] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)


  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/session/').then(r => r.json()),
      fetch('http://localhost:8000/api/settings/').then(r => r.json()),

    ]).then(([session, settings]) => {

      setMessages(session.chat_history || [])
      setPersona(settings.active_persona)
      setStudyMode(settings.study_mode)

    }).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages, loading])

  async function send(){

    if (!input.trim() || loading) return

    const userMsg = {role: 'user', message: input.trim(), timestamp: new Date().toISOString()}

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try{

      const res = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: userMsg.message }),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      setMessages(prev => [...prev, {role: 'assistant', message: data.response, timestamp: new Date().toISOString()}])
      setPersona(data.persona_used)
      setStudyMode(data.study_mode)

    }catch{
      setError('Could not reach the backend.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e){
    if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); send()}
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden'}}>

      
      <div style={{padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0}}>
        
        <div>
          <h1 style={{fontFamily: 'var(--heading-font)', fontSize: '22px', marginBottom: '2px'}}>Chat</h1>        
        </div>

        <div style={{display: 'flex', gap: '8px', fontFamily: 'var(--mono)', fontSize: '12px'}}>

          <span style={{padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border)', color: '#8b93a7'}}>

            {PERSONA_LABELS[persona] || 'Academic Advisor'}
          </span>

          <span style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border)', color: studyMode ? 'var(--accent)' : '#8b93a7' }}>
            Study mode: {studyMode ? 'on' : 'off'}
          </span>

        </div>
      </div>

      

      <div style={{flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
        
        {messages.length === 0 && (
          <div style={{textAlign: 'center', padding: '60px 0', color: '#8b93a7', fontFamily: 'var(--mono)', fontSize: '13px'}}>
            Ask about your schedule, deadlines, or get study help.
          </div>
        )}

        {messages.map((m, i) => <Message key={i} msg={m} />)}

        {loading && (

          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0}}>
              🤖
            </div>

            <div style={{padding: '12px 16px', borderRadius: '4px 12px 12px 12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center'}}>
              <div className="spinner" style={{ width: '14px', height: '14px' }} />
              <span style={{fontFamily: 'var(--mono)', fontSize: '12px', color: '#8b93a7'}}>thinking...</span>
            </div>

          </div>
        )}

        {error && <div className="error-box">{error}</div>}
        <div ref={bottomRef} />
      </div>

      
      <div style={{padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0}}>
        
        <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>

          <textarea
            className="textarea"
            style={{flex: 1, minHeight: '80px', maxHeight: '200px', resize: 'none', fontSize: '13px', padding: '12px'}}
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />

          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{padding: '10px 18px', flexShrink: 0}}>
            Send
          </button>

        </div>
        
      </div>

    </div>
  )
}