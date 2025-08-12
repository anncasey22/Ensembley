// src/results.jsx
import { useEffect, useMemo, useState } from 'react'
import './results.css'

const RECS_KEY = 'recommendations'
const STORAGE_KEY = 'scrolling_interactions'

function Results() {
  const [recs, setRecs] = useState({ recommendations: { events: [] }, userPreferences: {} })
  const [paste, setPaste] = useState('')
  const [data, setData] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // Load interactions data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setData(raw ? JSON.parse(raw) : [])
    } catch {
      setData([])
    }
  }, [])

  // Quick tallies by type/value
  const tallies = useMemo(() => {
    const t = { genre: {}, instrument: {}, artist: {} }
    data.forEach(({ type, value }) => {
      if (!t[type]) t[type] = {}
      t[type][value] = (t[type][value] || 0) + 1
    })
    return t
  }, [data])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setRecs({ 
            recommendations: { events: parsed }, 
            userPreferences: { genres: [], instruments: [], artists: [] } 
          })
        } else if (parsed.recommendations) {
          setRecs(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load saved recommendations:', e)
    }
  }, [])

  // Function to clean AI response and parse JSON
  const cleanAndParseResponse = (response) => {
    try {
      // Remove markdown code blocks
      let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
      
      // Try to find JSON array in the response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }
      
      const parsed = JSON.parse(cleaned)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.error('JSON parse error:', e)
      throw new Error('Invalid JSON format in AI response')
    }
  }

  // Send to AI agent
  const sendToAgent = async () => {
    if (!data.length) {
      setError('No interaction data available. Try using the app first!')
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a music event recommendation system. Based on user interactions, recommend 3-5 open mic events that match their preferences. Return ONLY a JSON array of events with name, location (address, lat, lng), why (explanation), people (array of names), date, time, and description fields.'
            },
            {
              role: 'user',
              content: `Based on these user interactions: ${JSON.stringify(data)}, recommend open mic events in the San Francisco Bay Area.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      const aiResponse = result.choices[0].message.content

      const events = cleanAndParseResponse(aiResponse)
      
      const newRecs = {
        recommendations: { events },
        userPreferences: {
          genres: Object.keys(tallies.genre || {}),
          instruments: Object.keys(tallies.instrument || {}),
          artists: Object.keys(tallies.artist || {})
        }
      }

      setRecs(newRecs)
      localStorage.setItem(RECS_KEY, JSON.stringify(newRecs))

    } catch (err) {
      console.error('AI request failed:', err)
      setError(err.message || 'Failed to get recommendations. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Load from manual paste
  const loadPaste = () => {
    if (!paste.trim()) return
    
    try {
      const events = cleanAndParseResponse(paste)
      const newRecs = {
        recommendations: { events },
        userPreferences: {
          genres: Object.keys(tallies.genre || {}),
          instruments: Object.keys(tallies.instrument || {}),
          artists: Object.keys(tallies.artist || {})
        }
      }
      setRecs(newRecs)
      localStorage.setItem(RECS_KEY, JSON.stringify(newRecs))
      setPaste('')
      setError('')
    } catch (err) {
      setError('Invalid JSON format in pasted data')
    }
  }

  // Clear recommendations
  const clear = () => {
    localStorage.removeItem(RECS_KEY)
    setRecs({ recommendations: { events: [] }, userPreferences: {} })
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Your Personalized Recommendations</h1>
      </div>
      <div className="results-content">
        <div className="button-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
          <button 
            className="primary-button" 
            disabled={!data.length || sending} 
            onClick={sendToAgent}
          >
            {sending ? 'Getting recommendations...' : 'Get AI Recommendations'}
          </button>
          <button className="primary-button" onClick={clear} disabled={!recs.recommendations.events.length}>
            Clear
          </button>
        </div>

        {error && <p style={{ color: '#d32f2f', marginTop: '1rem', background: 'white', padding: '10px', borderRadius: '4px' }}>{error}</p>}

        {/* Show current preferences summary */}
        {data.length > 0 && (
          <div style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            marginTop: '20px',
            marginBottom: '20px',
            border: '1px solid #ccc'
          }}>
            <h3 style={{ color: '#1a73e8', marginBottom: '10px' }}>Based on Your Likes:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(tallies).map(([type, counts]) => (
                Object.keys(counts).length > 0 && (
                  <div key={type}>
                    <strong style={{ color: '#333', textTransform: 'capitalize' }}>{type}s:</strong>
                    <span style={{ color: '#555' }}> {Object.entries(counts).map(([val, cnt]) => `${val} (${cnt})`).join(', ')}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Display AI recommendations */}
        <div className="results-list">
          {recs.recommendations.events.length > 0 ? (
            recs.recommendations.events.map((event, index) => (
              <div key={index} className="result-card">
                <div className="result-title">
                  🎤 {event.name}
                </div>
                
                {event.description && (
                  <div className="result-details" style={{ marginBottom: '15px' }}>
                    {event.description}
                  </div>
                )}
                
                {event.location && (
                  <div className="result-details">
                    <strong>📍 Location:</strong> {event.location.address || 'Address not available'}
                  </div>
                )}
                
                {event.why && (
                  <div className="result-details" style={{ marginTop: '10px' }}>
                    <strong>🎯 Why this matches you:</strong> {event.why}
                  </div>
                )}
                
                {event.people && event.people.length > 0 && (
                  <div className="result-details" style={{ marginTop: '10px' }}>
                    <strong>👥 People you might meet:</strong> {event.people.join(', ')}
                  </div>
                )}
                
                {event.date && (
                  <div className="result-details" style={{ marginTop: '10px' }}>
                    <strong>📅 Date:</strong> {event.date}
                  </div>
                )}
                
                {event.time && (
                  <div className="result-details" style={{ marginTop: '10px' }}>
                    <strong>🕐 Time:</strong> {event.time}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="result-card" style={{ textAlign: 'center', color: '#666' }}>
              <p>No recommendations yet!</p>
              <p style={{ fontSize: '0.9em' }}>
                Click Get AI Recommendations above to find some events that match your taste!
              </p>
            </div>
          )}
        </div>
        
        {/* Manual paste input for testing */}
        <details style={{ marginTop: '2rem' }}>
          <summary style={{ cursor: 'pointer', color: '#666', fontSize: '0.9em' }}>
            Manual JSON Input (for testing)
          </summary>
          <div style={{ marginTop: '1rem' }}>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Paste JSON recommendations here..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9em'
              }}
            />
            <button 
              className="primary-button" 
              onClick={loadPaste}
              style={{ marginTop: '0.5rem' }}
            >
              Load JSON
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}

export default Results
