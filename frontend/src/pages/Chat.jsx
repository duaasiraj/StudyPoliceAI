import { useState, useEffect, useRef } from 'react'

const PERSONA_META = {
  academic_advisor: {label:'Academic Advisor',color: '#4d9fff', icon: '🎓'},
  crisis_planner:   { label: 'Crisis Planner',color: '#ffd60a', icon: '🚨'},
  desi_parent:      { label: 'Desi Parent',color: '#a855f7', icon: '👨‍👩‍👧'},
  roast_engine:     { label: 'Roast Engine',color: '#ff4d6d', icon: '🔥'},
}

function Message({msg}){

    const isUser = msg.role === 'user'
    return (

       <div style={{
            display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
            gap: '10px', alignItems: 'flex-start', animation: 'fadeUp 0.25s ease',
        }}>

        <div style={{
            width: '32px', height: '32px', border: `1px solid ${isUser ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: '8px', background: isUser ? 'var(--accent-bg)' : 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
        }}>
            {isUser ? '🧍' : '🤖'}
        </div>

        <div style={{
            maxWidth: '75%', padding: '12px 16px', borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            background: isUser ? 'var(--accent-bg)' : 'var(--bg3)',
            border: `1px solid ${isUser ? 'var(--accent-border)' : 'var(--border)'}`,
            fontSize: '14px', color: 'var(--text2)', lineHeight: 1.65,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
            {msg.message}
            {msg.timestamp && (

            <div style={{ fontSize: '10px', color: 'var(--text)', marginTop: '6px', fontFamily: 'var(--mono)' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            )}

        </div>
    </div> 
    )

}


export default function Chat(){

    const [messages, setMessages] = useState([])
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
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])


    const send = async () => {

        if (!input.trim() || loading) return

        const userMsg = {role: 'user', message: input.trim(), timestamp: new Date().toISOString()}

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        setError(null)

        try {
        const res = await fetch('http://localhost:8000/api/chat/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: userMsg.message}),
        })

        if (!res.ok) throw new Error('Chat failed')

        const data = await res.json()
        setMessages(prev => [...prev, {role: 'assistant', message: data.response, timestamp: new Date().toISOString()}])
        setPersona(data.persona_used)
        setStudyMode(data.study_mode)

        }catch{
            setError('Could not reach the AI. Is the backend running?')
        }finally{
            setLoading(false)
        }
    }

    const handleKey = (e) => { 
        if(e.key === 'Enter' && !e.shiftKey){ 
            e.preventDefault(); send() 
        } 
    }
    const personaMeta = PERSONA_META[persona] || PERSONA_META.academic_advisor

    return(
    <div style={{display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden'}}>
      
      <div style={{padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0}}>
        
        <div>
            <div style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '25px' }}>AI Chat</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)', marginTop: '2px' }}>// powered by groq + llama 3.3 70b</div>
        </div>


        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '4px', fontSize: '15px',
            fontFamily: 'var(--mono)', border: `1px solid ${personaMeta.color}33`,
            background: `${personaMeta.color}11`, color: personaMeta.color,
          }}>
            {personaMeta.icon} {personaMeta.label}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: '4px', fontSize: '15px', fontFamily: 'var(--mono)',
            background: studyMode ? 'var(--green-bg)' : 'var(--bg3)',
            color: studyMode ? 'var(--green)' : 'var(--text)',
            border: studyMode ? '1px solid rgba(0,229,160,0.25)' : '1px solid var(--border)',
          }}>
            {studyMode ? '📚 Study Mode ON' : '😴 Study Mode OFF'}
          </span>
        </div>
        </div>




        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <div className="empty-title">Start a conversation</div>
            <div className="empty-sub">Ask about your schedule, deadlines, or get study help.</div>
          </div>
        )}

        {messages.map((m, i) => <Message key={i} msg={m} />)}

        {loading && (

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🤖</div>
            <div style={{ padding: '12px 16px', borderRadius: '4px 12px 12px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />

              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text)' }}>thinking...</span>
            </div>
          </div>
        )}
        {error && <div className="error-banner">{error}</div>}
        <div ref={bottomRef} />
      </div>  



        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            className="textarea"
            style={{ minHeight: '80px', maxHeight: '200px', borderRadius: '8px', resize: 'none', flex: 1, fontSize: '13px', padding: '18px 20px' }}
            placeholder="Ask about your studies, deadlines, schedule..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ padding: '10px 18px', flexShrink: 0 }}>
            {loading ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#fff' }} /> : '↑ Send'}
          </button>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text)', marginTop: '6px' }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>

    </div>


    )
}