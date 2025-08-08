import { useEffect, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'scrolling_interactions'

const FEED = [
  {
    id: 'item-1',
    src: 'https://videos.pexels.com/video-files/2795733/2795733-hd_1920_1080_25fps.mp4',
    type: 'video',
    genre: 'jazz',
    instrument: 'guitar',
    artist: 'Ava Martinez',
  },
  {
    id: 'item-2',
    src: 'https://videos.pexels.com/video-files/2795733/2795733-hd_1920_1080_25fps.mp4',
    type: 'video',
    genre: 'indie',
    instrument: 'piano',
    artist: 'Noah Kim',
  },
  {
    id: 'item-3',
    src: 'https://videos.pexels.com/video-files/2795733/2795733-hd_1920_1080_25fps.mp4',
    type: 'video',
    genre: 'blues',
    instrument: 'drums',
    artist: 'Lia Chen',
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
          const vid = entry.target
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            vid.play().catch(() => {})
          } else {
            vid.pause()
          }
        })
      },
      { threshold: [0, 0.6, 1] }
    )
    Object.values(videoRefs.current).forEach(v => v && obs.observe(v))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="scroll-feed">
      {FEED.map(item => {
        const gKey = `${item.id}:genre`
        const iKey = `${item.id}:instrument`
        const aKey = `${item.id}:artist`

        return (
          <div key={item.id} className="scroll-item">
            <div className="video-container">
              <video
                ref={el => (videoRefs.current[item.id] = el)}
                className="video"
                src={item.src}
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="action-buttons">
                <button
                  className={`tt-chip ${likedMap[gKey] ? 'active' : ''}`}
                  onClick={() => record('genre', item.genre, item.id)}
                >🎵</button>
                <button
                  className={`tt-chip ${likedMap[iKey] ? 'active' : ''}`}
                  onClick={() => record('instrument', item.instrument, item.id)}
                >🎸</button>
                <button
                  className={`tt-chip ${likedMap[aKey] ? 'active' : ''}`}
                  onClick={() => record('artist', item.artist, item.id)}
                >👤</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Scrolling
