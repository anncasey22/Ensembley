import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'scrolling_interactions'
const RECS_KEY = 'recommendations'

function Interactions() {
  const navigate = useNavigate()
  const [data, setData] = useState([])     
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

  //quick tallies by type/value for the agent 
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
      //   prompt based on the user's likes
      const likedGenres = Object.keys(tallies.genre || {})
      const likedInstruments = Object.keys(tallies.instrument || {})
      const likedArtists = Object.keys(tallies.artist || {})
      
      const userPreferences = {
        genres: Object.entries(tallies.genre || {})
          .map(([genre, count]) => ({ name: genre, count })),
        instruments: Object.entries(tallies.instrument || {})
          .map(([instrument, count]) => ({ name: instrument, count })),
        artists: Object.entries(tallies.artist || {})
          .map(([artist, count]) => ({ name: artist, count }))
      };

      const res = await fetch('https://noggin.rea.gent/nearby-wildcat-7659', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer rg_v1_qh1ukkarsywpjfxoxjgdltb5pdj1rjz2h229_ngk'
        },
        body: JSON.stringify({
          prompt: `Based on the user's music preferences, suggest 3 local open mic events. The user has liked these genres: ${likedGenres.join(', ')}, these instruments: ${likedInstruments.join(', ')}, and these artists: ${likedArtists.join(', ')}. For each event, provide: 1) venue name and brief description, 2) why it matches their specific preferences (reference their liked genres/instruments/artists), 3) what kind of performances they might expect there. Make it personalized and explain the connection to their exact preferences. Format as JSON with 'events' array containing objects with 'name', 'description', and 'matchReason' fields.`
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const response = await res.text()
      
      let payload;
      try {
        //try to parse the response as JSON
        const jsonResponse = JSON.parse(response)
        
        // handle the AI's current response format
        if (jsonResponse.events) {
          const convertedEvents = jsonResponse.events.map(event => ({
            name: event.venue_name || event.name || 'Open Mic Venue',
            description: event.description || '',
            matchReason: event.match || event.matchReason || '',
            expectedPerformances: event.performances || event.expectedPerformances || ''
          }))
          
          payload = {
            recommendations: { events: convertedEvents },
            userPreferences: {
              genres: Object.keys(tallies.genre || {}),
              instruments: Object.keys(tallies.instrument || {}),
              artists: Object.keys(tallies.artist || {})
            },
            rawInteractions: data
          }
        } else if (jsonResponse.openMicEvents) {
          // Handle previous format
          const convertedEvents = jsonResponse.openMicEvents.map(event => ({
            name: event.venue?.name || 'Open Mic Venue',
            description: event.venue?.description || '',
            matchReason: event.matchReason || '',
            expectedPerformances: event.expectedPerformances || ''
          }))
          
          payload = {
            recommendations: { events: convertedEvents },
            userPreferences: {
              genres: Object.keys(tallies.genre || {}),
              instruments: Object.keys(tallies.instrument || {}),
              artists: Object.keys(tallies.artist || {})
            },
            rawInteractions: data
          }
        } else {
          //fallback for other JSON formats
          payload = {
            recommendations: jsonResponse,
            userPreferences: {
              genres: Object.keys(tallies.genre || {}),
              instruments: Object.keys(tallies.instrument || {}),
              artists: Object.keys(tallies.artist || {})
            },
            rawInteractions: data
          }
        }
      } catch (e) {
        //if response isn't JSON, treat as plain text
        payload = {
          recommendations: {
            events: [
              {
                name: "AI Generated Open Mic Recommendations",
                description: response,
                matchReason: `Based on your preferences: ${Object.keys(tallies.genre || {}).join(', ')} genres, ${Object.keys(tallies.instrument || {}).join(', ')} instruments, ${Object.keys(tallies.artist || {}).join(', ')} artists`
              }
            ]
          },
          userPreferences: {
            genres: Object.keys(tallies.genre || {}),
            instruments: Object.keys(tallies.instrument || {}),
            artists: Object.keys(tallies.artist || {})
          },
          rawInteractions: data
        }
      }
      
      //save to local storage for the results page
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
