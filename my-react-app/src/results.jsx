// src/results.jsx
import { useEffect, useMemo, useState } from 'react'
import './results.css'

const RECS_KEY = 'recommendations'
const STORAGE_KEY = 'scrolling_interactions'

/**
 * expected json shape (array of 3+ items):
 * [
 *  {
 *    "name": "Cafe Blue Open Mic",
 *    "location": { "lat": 37.8715, "lng": -122.2730, "address": "2420 Shattuck Ave, Berkeley, CA" },
 *    "why": "you like guitar + jazz, this spot hosts live jazz guitar sets…",
 *    "people": ["Ava Martinez", "Noah Kim", "Lia Chen"]
 *  },
 *  ...
 * ]
 */

function Results() {
  const [recs, setRecs] = useState({ recommendations: { events: [] }, userPreferences: {} })
  const [paste, setPaste] = useState('')
  const [data, setData] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  //load interactions data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setData(raw ? JSON.parse(raw) : [])
    } catch {
      setData([])
    }
  }, [])

  //quick tallies by type/value
  const tallies = useMemo(() => {
    const t = { genre: {}, instrument: {}, artist: {} }
    data.forEach(({ type, value }) => {
      if (!t[type]) t[type] = {}
      t[type][value] = (t[type][value] || 0) + 1
    })
    return t
  }, [data])

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECS_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      
      // Handle both old and new formats
      if (parsed) {
        if (Array.isArray(parsed)) {
          // Old format - convert to new format
          setRecs({ 
            recommendations: { events: parsed }, 
            userPreferences: { genres: [], instruments: [], artists: [] } 
          })
        } else if (parsed.recommendations) {
          // Our expected format
          setRecs(parsed)
        } else if (parsed.events) {
          // AI's current format - convert it
          const convertedEvents = parsed.events.map(event => ({
            name: event.venue_name || event.name || 'Open Mic Venue',
            description: event.description || '',
            matchReason: event.match || event.matchReason || '',
            expectedPerformances: event.performances || event.expectedPerformances || '',
            peopleWillAttend: event['people will attend'] || event.peopleWillAttend || ''
          }))
          setRecs({ 
            recommendations: { events: convertedEvents }, 
            userPreferences: parsed.userPreferences || { genres: [], instruments: [], artists: [] }
          })
        } else if (parsed.openMicEvents) {
          // AI's previous format - convert it
          const convertedEvents = parsed.openMicEvents.map(event => ({
            name: event.venue?.name || 'Open Mic Venue',
            description: event.venue?.description || '',
            matchReason: event.matchReason || '',
            expectedPerformances: event.expectedPerformances || ''
          }))
          setRecs({ 
            recommendations: { events: convertedEvents }, 
            userPreferences: parsed.userPreferences || { genres: [], instruments: [], artists: [] }
          })
        } else {
          // Try to parse as single event
          setRecs({ 
            recommendations: { events: [parsed] }, 
            userPreferences: { genres: [], instruments: [], artists: [] } 
          })
        }
      } else {
        setRecs({ recommendations: { events: [] }, userPreferences: {} })
      }
    } catch {
      setRecs({ recommendations: { events: [] }, userPreferences: {} })
    }
  }, [])

  const loadPaste = () => {
    try {
      const parsed = JSON.parse(paste)
      
      // Handle direct AI response format
      let formattedData;
      if (parsed.events) {
        // Convert AI format to our internal format
        const convertedEvents = parsed.events.map(event => ({
          name: event.venue_name || event.name || 'Open Mic Venue',
          description: event.description || '',
          matchReason: event.match || event.matchReason || '',
          expectedPerformances: event.performances || event.expectedPerformances || '',
          peopleWillAttend: event['people will attend'] || event.peopleWillAttend || ''
        }))
        
        formattedData = {
          recommendations: { events: convertedEvents },
          userPreferences: { genres: [], instruments: [], artists: [] }
        }
      } else {
        formattedData = parsed
      }
      
      localStorage.setItem(RECS_KEY, JSON.stringify(formattedData))
      setRecs(formattedData)
      setPaste('')
    } catch {
      alert('invalid json')
    }
  }

  const sendToAgent = async () => {
    setSending(true)
    setError('')
    try {
      // Create a detailed prompt based on the user's likes
      const likedGenres = Object.keys(tallies.genre || {})
      const likedInstruments = Object.keys(tallies.instrument || {})
      const likedArtists = Object.keys(tallies.artist || {})
      
      if (likedGenres.length === 0 && likedInstruments.length === 0 && likedArtists.length === 0) {
        setError('No preferences found. Go to the scrolling page and like some content first!')
        setSending(false)
        return
      }

      const res = await fetch('https://noggin.rea.gent/nearby-wildcat-7659', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer rg_v1_qh1ukkarsywpjfxoxjgdltb5pdj1rjz2h229_ngk'
        },
        body: JSON.stringify({
          prompt: `Below is the prompt which included the user genre, instrument, and artist likes. 
          Based on their likes match it: The user has liked these genres: ${likedGenres.join(', ')}, 
          these instruments: ${likedInstruments.join(', ')}, and these artists: ${likedArtists.join(', ')}. 
          For each event, provide: 1) venue name and brief description, 2) why it matches their specific 
          preferences (reference their liked genres/instruments/artists), 3) what kind of performances they
           might expect there, 4) which people from the list would likely attend this event based on their 
           musical interests. Make it personalized and explain the connection to their exact preferences.`
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const response = await res.text()
      
      let payload;
      try {
        //try to parse the response as JSON
        let jsonText = response.trim()
        
        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        const jsonResponse = JSON.parse(jsonText)
        
        //handle the AI's current response format
        if (jsonResponse.events) {
          const convertedEvents = jsonResponse.events.map(event => ({
            name: event.venue_name || event.name || 'Open Mic Venue',
            description: event.description || '',
            matchReason: event.match || event.matchReason || '',
            expectedPerformances: event.performances || event.expectedPerformances || '',
            peopleWillAttend: event['people will attend'] || event.peopleWillAttend || ''
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
          //error stuff for json
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
        console.error('Failed to parse AI response:', e)
        console.log('Raw AI response:', response)
        //if response isn't JSON, its basically j format as plain text
        payload = {
          recommendations: {
            events: [
              {
                name: "AI Generated Open Mic Recommendations",
                description: response,
                matchReason: `Based on your preferences: ${likedGenres.join(', ')} genres, ${likedInstruments.join(', ')} instruments, ${likedArtists.join(', ')} artists`
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
      
      //save to local storage and update state
      localStorage.setItem(RECS_KEY, JSON.stringify(payload))
      setRecs(payload)
    } catch (e) {
      setError('Failed to send to AI agent. Check the endpoint and server logs.')
    } finally {
      setSending(false)
    }
  }

  const clear = () => {
    localStorage.removeItem(RECS_KEY)
    setRecs({ recommendations: { events: [] }, userPreferences: {} })
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1 style={{ color: '#333' }}>Your Personalized Recommendations</h1>
      </div>
      <div className="results-content">
        <div className="button-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
          <button 
            className="primary-button" 
            disabled={!data.length || sending} 
            onClick={sendToAgent}
            style={{ fontSize: '0.9em' }}
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
          border: '1px solid #ccc',
          color: '#333'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#1a73e8' }}>Your Current Preferences:</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {Object.keys(tallies.genre || {}).length > 0 && (
              <div>
                <strong style={{ color: '#333' }}>Genres:</strong> 
                <span style={{ color: '#555' }}> {Object.keys(tallies.genre).join(', ')}</span>
              </div>
            )}
            {Object.keys(tallies.instrument || {}).length > 0 && (
              <div>
                <strong style={{ color: '#333' }}>Instruments:</strong>
                <span style={{ color: '#555' }}> {Object.keys(tallies.instrument).join(', ')}</span>
              </div>
            )}
            {Object.keys(tallies.artist || {}).length > 0 && (
              <div>
                <strong style={{ color: '#333' }}>Artists:</strong>
                <span style={{ color: '#555' }}> {Object.keys(tallies.artist).join(', ')}</span>
              </div>
            )}
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            Click Get AI Recommendations above to find some events that match your taste!
          </p>
        </div>
      )}

      {/* Show user preferences that led to recommendations */}
      {recs.recommendations.events.length > 0 && (
        <div style={{ 
          background: 'white', 
          padding: '15px', 
          borderRadius: '8px', 
          marginTop: '20px',
          marginBottom: '20px',
          border: '1px solid #ccc'
        }}>
          <h3 style={{ color: '#1a73e8', marginBottom: '10px' }}>Based on Your Likes:</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            {recs.userPreferences.genres?.length > 0 && (
              <div>
                <strong style={{ color: '#333' }}>Genres:</strong>
                <span style={{ color: '#555' }}> {recs.userPreferences.genres.join(', ')}</span>
              </div>
            )}
            {recs.userPreferences.instruments?.length > 0 && (
              <div>
                <strong style={{ color: '#333' }}>Instruments:</strong>
                <span style={{ color: '#555' }}> {recs.userPreferences.instruments.join(', ')}</span>
              </div>
            )}
            {recs.userPreferences.artists?.length > 0 && (
              <div>
                <strong style={{ color: '#333' }}>Artists:</strong>
                <span style={{ color: '#555' }}> {recs.userPreferences.artists.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display AI recommendations */}
      {recs.recommendations.events.length > 0 && (
        <div>
          {recs.recommendations.events.map((event, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ 
                color: '#1a73e8', 
                marginBottom: '12px',
                fontSize: '1.4em',
                fontWeight: '600'
              }}>
                🎤 {event.name}
              </h3>
              
              {event.description && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #e9ecef'
                }}>
                  <p style={{ 
                    fontSize: '1.1em', 
                    marginBottom: '0',
                    color: '#495057'
                  }}>
                    {event.description}
                  </p>
                </div>
              )}
              
              {event.matchReason && (
                <div style={{
                  background: '#e8f5e8',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #c3e6c3'
                }}>
                  <h4 style={{ 
                    color: '#2d5a2d',
                    marginBottom: '8px',
                    fontSize: '1.1em'
                  }}>
                    🎯 Why this matches you:
                  </h4>
                  <p style={{ 
                    color: '#2d5a2d', 
                    marginBottom: '0',
                    fontStyle: 'italic'
                  }}>
                    {event.matchReason}
                  </p>
                </div>
              )}
              
              {event.expectedPerformances && (
                <div style={{
                  background: '#fff3cd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #ffeaa7'
                }}>
                  <h4 style={{ 
                    color: '#856404',
                    marginBottom: '8px',
                    fontSize: '1.1em'
                  }}>
                    🎵 What to expect:
                  </h4>
                  <p style={{ 
                    color: '#856404', 
                    marginBottom: '0'
                  }}>
                    {event.expectedPerformances}
                  </p>
                </div>
              )}
              
              {event.peopleWillAttend && (Array.isArray(event.peopleWillAttend) ? event.peopleWillAttend.length > 0 : event.peopleWillAttend) && (
                <div style={{
                  background: '#e8f4fd',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #b3d9ff'
                }}>
                  <h4 style={{ 
                    color: '#1565c0',
                    marginBottom: '8px',
                    fontSize: '1.1em'
                  }}>
                    👥 People who might attend:
                  </h4>
                  <div style={{ 
                    color: '#1565c0', 
                    marginBottom: '0'
                  }}>
                    {Array.isArray(event.peopleWillAttend) ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {event.peopleWillAttend.map((person, idx) => (
                          <span key={idx} style={{
                            background: 'rgba(21, 101, 192, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.9em',
                            border: '1px solid rgba(21, 101, 192, 0.3)'
                          }}>
                            {person}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ marginBottom: '0' }}>{event.peopleWillAttend}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  )
}

export default Results
