import { useEffect, useRef, useState } from 'react'
import './App.css'
import { FaMusic, FaGuitar, FaUser } from 'react-icons/fa'
import './scrolling.css'

const STORAGE_KEY = 'scrolling_interactions'

const FEED = [
  {
    id: 'item-1',
    videoId: 'd5FpxXqZYgs',
    type: 'youtube',
    genre: 'rock',
    instrument: 'drums',
    artist: 'John Lennon ',
  },
  
  {
    id: 'item-2',
    videoId: 'AxAzsM6X-mQ',
    type: 'youtube',
    genre: 'jazz',
    instrument: 'piano',
    artist: 'Noah Kim',
  },

  {
    id: 'item-4',
    videoId: '-MmVRiUjhOM',
    type: 'youtube',
    genre: 'jazz',
    instrument: 'trumpet',
    artist: 'Marcus Johnson',
  },

  {
    id: 'item-3',
    videoId: 'k7yg5Gn31kg',
    type: 'youtube',
    genre: 'blues',
    instrument: 'drums',
    artist: 'Lia Chen',
  },

  {
    id: 'item-8',
    videoId: 'CzsnXrygTmk',
    type: 'youtube',
    genre: 'classical',
    instrument: 'piano',
    artist: 'Hannah Bennet',
  },

  {
    id: 'item-7',
    videoId: 'AxAzsM6X-mQ',
    type: 'youtube',
    genre: 'jazz',
    instrument: 'piano',
    artist: 'Liam Bennet',
  },

  {
    id: 'item-5',
    videoId: 'gnZkjjqoMWU',
    type: 'youtube',
    genre: 'classical',
    instrument: 'violin',
    artist: 'Tom Martinez',
  },

  {
    id: 'item-6',
    videoId: 'd5FpxXqZYgs',
    type: 'youtube',
    genre: 'rock',
    instrument: 'drums',
    artist: 'Elliot Smith ',
  },
  {
    id: 'item-9',
    videoId: 'XFUK6ZQw7Ug',
    type: 'youtube',
    genre: 'jazz',
    instrument: 'guitar',
    artist: 'Connor Martinez',
  },

  {
    id: 'item-10',
    videoId: '_isNECbisPk',
    type: 'youtube',
    genre: 'phonk',
    instrument: 'violent',
    artist: 'Amanda',
  },

  {
    id: 'item-11',
    videoId: 'LfskMYLvhWo',
    type: 'youtube',
    genre: 'phonk',
    instrument: 'electric guitar',
    artist: 'danteswan',
  },

  {
    id: 'item-12',
    videoId: 'awgLII81Msw',
    type: 'youtube',
    genre: 'rock',
    instrument: 'guitar',
    artist: 'kaiz',
  },

  {
    id: 'item-13',
    videoId: 'sI1371rVvWQ',
    type: 'youtube',
    genre: 'pop',
    instrument: 'voice',
    artist: 'phao',
  },

]

function loadInteractions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveInteractions(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function Scrolling() {
  const [interactions, setInteractions] = useState(loadInteractions())
  const [likedMap, setLikedMap] = useState(() => {
    const m = {}
    loadInteractions().forEach(i => { m[`${i.itemId}:${i.type}`] = true })
    return m
  })
  const videoRefs = useRef({})
  const youtubePlayersRef = useRef({})
  const [isYouTubeAPIReady, setIsYouTubeAPIReady] = useState(false)

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        setIsYouTubeAPIReady(true)
      }
    } else if (window.YT && window.YT.Player) {
      setIsYouTubeAPIReady(true)
    }
  }, [])

  // Create YouTube players when API is ready
  useEffect(() => {
    if (!isYouTubeAPIReady) return

    FEED.filter(item => item.type === 'youtube').forEach(item => {
      if (!youtubePlayersRef.current[item.id]) {
        const playerElement = document.getElementById(`youtube-${item.id}`)
        if (playerElement) {
          youtubePlayersRef.current[item.id] = new window.YT.Player(`youtube-${item.id}`, {
            height: window.innerWidth > 768 ? '450' : '100%',
            width: window.innerWidth > 768 ? '800' : '100%',
            videoId: item.videoId,
            playerVars: {
              autoplay: 0, // Don't autoplay on creation
              controls: 0,
              mute: 1, // Start muted
              loop: 1,
              playlist: item.videoId,
              playsinline: 1,
              rel: 0,
              showinfo: 0,
              modestbranding: 1,
              fs: 0,
              iv_load_policy: 3,
              cc_load_policy: 0,
              disablekb: 1
            },
            events: {
              onReady: (event) => {
                // Configure iframe for proper scaling and reduced interference
                const iframe = event.target.getIframe()
                if (iframe) {
                  const isDesktop = window.innerWidth > 768
                  
                  if (isDesktop) {
                    // Desktop: fixed 16:9 aspect ratio
                    iframe.style.width = '800px'
                    iframe.style.height = '450px'
                    iframe.style.maxWidth = '90vw'
                    iframe.style.maxHeight = '80vh'
                    iframe.style.position = 'relative'
                  } else {
                    // Mobile: full container
                    iframe.style.width = '100%'
                    iframe.style.height = '100%'
                    iframe.style.position = 'absolute'
                  }
                  
                  iframe.style.border = 'none'
                  iframe.style.top = '0'
                  iframe.style.left = '0'
                  iframe.style.zIndex = '1'
                  iframe.style.pointerEvents = 'none' // Disable pointer events on iframe
                }
                
                // Don't autoplay on ready - let intersection observer handle it
              }
            }
          })
        }
      }
    })
  }, [isYouTubeAPIReady])

  const record = (type, value, itemId) => {
    const key = `${itemId}:${type}`
    const already = likedMap[key]
    const next = already
      ? interactions.filter(i => !(i.itemId === itemId && i.type === type))
      : [...interactions, { itemId, type, value, ts: Date.now() }]
    setInteractions(next)
    saveInteractions(next)
    setLikedMap(prev => ({ ...prev, [key]: !already }))
  }

  // autoplay/pause in viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const element = entry.target
          const itemId = element.getAttribute('data-item-id')
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            // First, pause all other videos/players
            Object.values(videoRefs.current).forEach(video => {
              if (video && video !== element) {
                video.pause()
              }
            })
            
            Object.entries(youtubePlayersRef.current).forEach(([id, player]) => {
              if (id !== itemId && player && player.pauseVideo) {
                player.pauseVideo()
                player.mute()
              }
            })
            
            // Then play the current one
            if (element.tagName === 'VIDEO') {
              element.play().catch(() => {})
            }
            else if (youtubePlayersRef.current[itemId]) {
              const player = youtubePlayersRef.current[itemId]
              if (player && player.playVideo) {
                player.playVideo()
                // Unmute when video comes into view
                setTimeout(() => {
                  if (player.unMute) {
                    player.unMute()
                  }
                }, 300)
              }
            }
          } else {
            // Pause when out of view
            if (element.tagName === 'VIDEO') {
              element.pause()
            }
            else if (youtubePlayersRef.current[itemId]) {
              const player = youtubePlayersRef.current[itemId]
              if (player && player.pauseVideo) {
                player.pauseVideo()
                player.mute()
              }
            }
          }
        })
      },
      { threshold: [0, 0.6, 1] }
    )
    
    // Observe regular videos
    Object.values(videoRefs.current).forEach(v => v && obs.observe(v))
    
    // Observe YouTube player containers
    FEED.filter(item => item.type === 'youtube').forEach(item => {
      const container = document.getElementById(`youtube-${item.id}`)
      if (container) {
        container.setAttribute('data-item-id', item.id)
        obs.observe(container)
      }
    })
    
    return () => obs.disconnect()
  }, [isYouTubeAPIReady])

  return (
    <div className="scroll-feed">
      <div className="app-header">
        <h1 className="app-name">Ensembley</h1>
      </div>
      {FEED.map(item => {
        const gKey = `${item.id}:genre`
        const iKey = `${item.id}:instrument`
        const aKey = `${item.id}:artist`

        return (
          <div key={item.id} className="scroll-item">
            <div className="video-container">
              {item.type === 'youtube' ? (
                <div 
                  style={{ 
                    position: 'relative',
                    overflow: 'hidden',
                    width: window.innerWidth > 768 ? 'auto' : '100%',
                    height: window.innerWidth > 768 ? 'auto' : '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <div
                    id={`youtube-${item.id}`}
                    className="video"
                    data-item-id={item.id}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: window.innerWidth > 768 ? '800px' : '100%',
                      height: window.innerWidth > 768 ? '450px' : '100%',
                      maxWidth: window.innerWidth > 768 ? '90vw' : '100%',
                      maxHeight: window.innerWidth > 768 ? '80vh' : '100%'
                    }}
                  />
                </div>
              ) : (
                <video
                  ref={el => (videoRefs.current[item.id] = el)}
                  className="video"
                  src={item.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  data-item-id={item.id}
                />
              )}
              <div className="action-buttons" style={{ 
                zIndex: 10, 
                position: 'absolute',
                pointerEvents: 'auto'
              }}>
  <div className="tt-chip-wrapper">
    <button
      className={`tt-chip ${likedMap[gKey] ? 'active' : ''}`}
      onClick={() => record('genre', item.genre, item.id)}
      style={{ pointerEvents: 'auto', zIndex: 11 }}
    >🎵</button>
    <span>Genre</span>
  </div>
  <div className="tt-chip-wrapper">
    <button
      className={`tt-chip ${likedMap[iKey] ? 'active' : ''}`}
      onClick={() => record('instrument', item.instrument, item.id)}
      style={{ pointerEvents: 'auto', zIndex: 11 }}
    >🎸</button>
    <span>Instrument</span>
  </div>
  <div className="tt-chip-wrapper">
    <button
      className={`tt-chip ${likedMap[aKey] ? 'active' : ''}`}
      onClick={() => record('artist', item.artist, item.id)}
      style={{ pointerEvents: 'auto', zIndex: 11 }}
    >👤</button>
    <span>User</span>
  </div>
</div>

            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Scrolling
