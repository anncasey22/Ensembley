import './results.css'
import './scrolling.css'
import { useEffect, useMemo, useRef, useState } from 'react'

const RECS_KEY = 'recommendations'
const STORAGE_KEY = 'scrolling_interactions'

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
            expectedPerformances: event.performances || event.expectedPerformances || ''
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
      localStorage.setItem(RECS_KEY, JSON.stringify(parsed))
      setRecs(parsed)
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
          prompt: `Based on the user's music preferences, suggest 3 local open mic events. The user has liked these genres: ${likedGenres.join(', ')}, these instruments: ${likedInstruments.join(', ')}, and these artists: ${likedArtists.join(', ')}. For each event, provide: 1) venue name and brief description, 2) why it matches their specific preferences (reference their liked genres/instruments/artists), 3) what kind of performances they might expect there. Make it personalized and explain the connection to their exact preferences.`
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const response = await res.text()
      
      let payload;
      try {
        //try to parse the response as JSON
        const jsonResponse = JSON.parse(response)
        
        //handle the AI's current response format
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
        <h1>Your Personalized Recommendations</h1>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: '1rem' }}>
          <button 
            className="primary-button" 
            disabled={!data.length || sending} 
            onClick={sendToAgent}
          >
            {sending ? 'Getting recommendations...' : 'Get AI Recommendations'}
          </button>
          <button className="primary-button" style={{ background: '#eee', color: '#333' }} onClick={clear} disabled={!recs.recommendations.events.length}>
            Clear
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#d32f2f', marginTop: '1rem', background: 'white', padding: '10px', borderRadius: '4px' }}>{error}</p>}

      {data.length > 0 && (
        <div className="results-content">
          <h3 className="result-title">Your Current Preferences:</h3>
          <div className="results-list" style={{ flexDirection: 'row', gap: '2rem', marginBottom: '1rem' }}>
            {Object.keys(tallies.genre || {}).length > 0 && (
              <div>
                <strong>Genres:</strong> 
                <span className="result-value"> {Object.keys(tallies.genre).join(', ')}</span>
              </div>
            )}
            {Object.keys(tallies.instrument || {}).length > 0 && (
              <div>
                <strong>Instruments:</strong>
                <span className="result-value"> {Object.keys(tallies.instrument).join(', ')}</span>
              </div>
            )}
            {Object.keys(tallies.artist || {}).length > 0 && (
              <div>
                <strong>Artists:</strong>
                <span className="result-value"> {Object.keys(tallies.artist).join(', ')}</span>
              </div>
            )}
          </div>
          <p className="result-details" style={{ marginTop: '10px' }}>
            Click Get AI Recommendations above to find some events that match your taste!
          </p>
        </div>
      )}

      {recs.recommendations.events.length > 0 && (
        <div className="results-content">
          <h3 className="result-title">Based on Your Likes:</h3>
          <div className="results-list" style={{ flexDirection: 'row', gap: '2rem', marginBottom: '1rem' }}>
            {recs.userPreferences.genres?.length > 0 && (
              <div>
                <strong>Genres:</strong>
                <span className="result-value"> {recs.userPreferences.genres.join(', ')}</span>
              </div>
            )}
            {recs.userPreferences.instruments?.length > 0 && (
              <div>
                <strong>Instruments:</strong>
                <span className="result-value"> {recs.userPreferences.instruments.join(', ')}</span>
              </div>
            )}
            {recs.userPreferences.artists?.length > 0 && (
              <div>
                <strong>Artists:</strong>
                <span className="result-value"> {recs.userPreferences.artists.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {recs.recommendations.events.length > 0 && (
        <div className="results-list">
          {recs.recommendations.events.map((event, index) => (
            <div key={index} className="result-card">
              <div className="result-title">🎤 {event.name}</div>
              {event.description && (
                <div className="result-details" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e9ecef' }}>
                  <p>{event.description}</p>
                </div>
              )}
              {event.matchReason && (
                <div className="result-details" style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #c3e6c3' }}>
                  <h4 style={{ color: '#2d5a2d', marginBottom: '8px', fontSize: '1.1em' }}>
                    🎯 Why this matches you:
                  </h4>
                  <p style={{ color: '#2d5a2d', marginBottom: '0', fontStyle: 'italic' }}>
                    {event.matchReason}
                  </p>
                </div>
              )}
              {event.expectedPerformances && (
                <div className="result-details" style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                  <h4 style={{ color: '#856404', marginBottom: '8px', fontSize: '1.1em' }}>
                    🎵 What to expect:
                  </h4>
                  <p style={{ color: '#856404', marginBottom: '0' }}>
                    {event.expectedPerformances}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!recs.recommendations.events.length && (
        <div className="results-content">
          <p>Paste your AI agent JSON:</p>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={8}
            style={{ width: '100%', fontFamily: 'monospace' }}
            placeholder='[{"name":"...", "location":{"lat":..,"lng":..,"address":"..."},"why":"...","people":["..."]}]'
          />
          <div style={{ marginTop: 8 }}>
            <button className="primary-button" onClick={loadPaste}>Load JSON</button>
          </div>
        </div>
      )}
    </div>
  )
}

function MapView({ events }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    // load script if not present
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const hasScript = !!document.querySelector('script[data-gmaps]')
    if (!hasScript) {
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`
      s.async = true
      s.defer = true
      s.setAttribute('data-gmaps', '1')
      document.head.appendChild(s)
      s.onload = init
    } else {
      init()
    }

    function init() {
      if (!mapRef.current) return
      // center on first event or a default
      const center = events[0]?.location
        ? { lat: events[0].location.lat, lng: events[0].location.lng }
        : { lat: 37.7749, lng: -122.4194 }

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: events.length > 1 ? 11 : 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      // clear old markers
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []

      const bounds = new window.google.maps.LatLngBounds()
      events.forEach(ev => {
        const pos = { lat: ev.location.lat, lng: ev.location.lng }
        const marker = new window.google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          title: ev.name || 'open mic',
        })
        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width:220px">
              <strong>${escapeHtml(ev.name || 'open mic')}</strong><br/>
              ${escapeHtml(ev?.location?.address || '')}<br/>
              <small>${escapeHtml(ev.why || '')}</small>
            </div>
          `
        })
        marker.addListener('click', () => info.open({ map: mapInstance.current, anchor: marker }))
        markersRef.current.push(marker)
        bounds.extend(pos)
      })

      if (events.length > 1) {
        mapInstance.current.fitBounds(bounds)
      }
    }

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
    }
  }, [events])

  return (
    <div className="result-map">
      {events.length === 0 ? (
        <p className="result-details">no mappable events (missing lat/lng)</p>
      ) : (
        <div ref={mapRef} style={{ width: '100%', height: '70vh', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }} />
      )}
    </div>
  )
}

// tiny helper to avoid raw HTML injection issues in info windows
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))
}

export default Results
