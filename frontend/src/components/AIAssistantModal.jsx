import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../api'
import './ai/ai.css'

const AI_BASE = 'http://127.0.0.1:8001'

function makeSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function formatMessage(text) {
  if (!text) return null

  const lines = text.split('\n').filter(line => line !== '')

  return lines.map((line, idx) => {
    const trimmed = line.trim()

    // bold markdown like **text**
    const withBold = trimmed.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })

    // numbered lines
    if (/^\d+\)/.test(trimmed)) {
      return (
        <div key={idx} className="ai-line ai-line-list">
          {withBold}
        </div>
      )
    }

    // suggestion line
    if (trimmed.startsWith('✅')) {
      return (
        <div key={idx} className="ai-line ai-line-success">
          {withBold}
        </div>
      )
    }

    // question line
    if (trimmed.includes('Do you want me to add')) {
      return (
        <div key={idx} className="ai-line ai-line-question">
          {withBold}
        </div>
      )
    }

    // normal line
    return (
      <div key={idx} className="ai-line">
        {withBold}
      </div>
    )
  })
}

export default function AIAssistantModal({ open, onClose, userFullName }) {
  const [sessionId, setSessionId] = useState(makeSessionId())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  const listRef = useRef(null)

  const welcome = useMemo(() => {
    return `Hi ${userFullName} 👋

I’m your Keells AI shopping assistant.

I can help you:
1) compare products
2) find cheaper alternatives
3) suggest the best-value item

Tell me what you want to buy, and I’ll help you choose the best option.`
  }, [userFullName])

  useEffect(() => {
    if (!open) return
    setSessionId(makeSessionId())
    setMessages([{ role: 'ai', text: welcome }])
    setInput('')
    setLoading(false)
  }, [open, welcome])

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, open])

  const handleClose = async () => {
    try {
      await fetch(`${AI_BASE}/session/${sessionId}`, { method: 'DELETE' })
    } catch {}
    onClose()
  }

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    setMessages((m) => [...m, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const res = await fetch(`${AI_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId, message: msg }),
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'AI service error')
      }

      const data = await res.json()
      setMessages((m) => [...m, { role: 'ai', text: data?.reply || '...' }])

      if ((data?.reply || '').toLowerCase().includes('added to cart')) {
        try {
          await api.get('/user/cart')
        } catch {}
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: '❌ Sorry, I could not reach the AI service right now. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!open) return null

  return (
    <div className="ai-overlay" role="dialog" aria-modal="true" aria-label="Keells AI Assistant">
      <div className="ai-modal">
        <div className="ai-header">
          <div>
            <div className="ai-title">Keells AI Assistant</div>
            <div className="ai-subtitle">Smart Product Comparison • Friendly Recommendations</div>
          </div>

          <button className="ai-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="ai-body">
          <div className="ai-messages" ref={listRef}>
            {messages.map((m, idx) => (
              <div key={`${m.role}_${idx}`} className={`ai-row ${m.role === 'user' ? 'right' : 'left'}`}>
                <div className={`ai-bubble ${m.role}`}>
                  {formatMessage(m.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-row left">
                <div className="ai-bubble ai">
                  <span className="ai-typing">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="ai-quick">
            <button className="ai-chip" onClick={() => send('compare milk 1L')}>Compare milk 1L</button>
            <button className="ai-chip" onClick={() => send('cheapest cheddar cheese')}>Cheapest cheddar cheese</button>
            <button className="ai-chip" onClick={() => send('Kotmale milk only')}>Kotmale milk only</button>
          </div>

          <div className="ai-inputBar">
            <textarea
              className="ai-input"
              placeholder='Ask: "compare milk 1L", "cheapest cheddar cheese", "show Kotmale milk"...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />
            <button className="ai-send" onClick={() => send()} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}