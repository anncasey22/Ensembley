import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'scrolling_interactions'
// optional: where to stash agent response for results page
const RECS_KEY = 'recommendations'

function Interactions() {
  const navigate = useNavigate()
  const [data, setData] = useState([])     // raw interactions
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setData(raw ? JSON.parse(raw) : [])
    } catch {
      setData([])
    }
  }, [])

  // quick tallies by type/value, useful for the agent or UI
  const tallies = useMemo(() => {
    const t = { genre: {}, instrument: {}, artist: {} }
    data.forEach(({ type, value }) => {
      if (!t[type]) t[type] = {}
      t[type][value] = (t[type][value] || 0) + 1
    })
    return t
  }, [data])

  const sendToAgent = async () => {
    setSending(true)
    setError('')
    try {
      // TODO: replace with your real endpoint
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactions: data,
          tallies,
          // you can also include user profile fields if you want
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = await res.json()

      // stash for results page (or route state if you prefer)
      localStorage.setItem(RECS_KEY, JSON.stringify(payload))
      navigate('/results')
    } catch (e) {
      setError('Failed to send to AI agent. Check the endpoint and server logs.')
    } finally {
      setSending(false)
    }
  }

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setData([])
  }

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      <h1>interactions</h1>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0', flexWrap: 'wrap' }}>
        <button className="primary-button" disabled={!data.length || sending} onClick={sendToAgent}>
          {sending ? 'sending…' : 'send to ai agent'}
        </button>
        <button onClick={clearData} disabled={!data.length}>
          clear
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <h3 style={{ marginTop: '1rem' }}>summary</h3>
      <pre style={pre}>{JSON.stringify(tallies, null, 2)}</pre>

      <h3>raw interactions</h3>
      <pre style={pre}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

const pre = {
  background: '#f7f7f7',
  padding: '0.75rem',
  borderRadius: 8,
  overflowX: 'auto',
}

export default Interactions
