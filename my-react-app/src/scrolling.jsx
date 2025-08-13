import { useEffect, useRef, useState } from 'react'
import './App.css'
import { FaMusic, FaGuitar, FaUser } from 'react-icons/fa'
import './scrolling.css'

const STORAGE_KEY = 'scrolling_interactions'

const FEED = [
  {
    id: 'item-1',
    src: 'https://videos.pexels.com/video-files/5659552/5659552-uhd_2732_1440_25fps.mp4',
    type: 'video',
    genre: 'rock',
    instrument: 'drums',
    artist: 'John Lennon ',
  },
  
  {
    id: 'item-2',
    src: 'https://videos.pexels.com/video-files/1892490/1892490-hd_1920_1080_24fps.mp4',
    type: 'video',
    genre: 'indie',
    instrument: 'piano',
    artist: 'Noah Kim',
  },

  {
    id: 'item-4',
    src: 'https://videos.pexels.com/video-files/2941115/2941115-uhd_2732_1440_24fps.mp4', // video of a man playing jazz trumpet on the street :contentReference[oaicite:1]{index=1}
    type: 'video',
    genre: 'jazz',
    instrument: 'trumpet',
    artist: 'Marcus Johnson',
  },

  {
    id: 'item-3',
    src: 'https://videos.pexels.com/video-files/3002399/3002399-hd_1920_1080_25fps.mp4',
    type: 'video',
    genre: 'blues',
    instrument: 'drums',
    artist: 'Lia Chen',
  },

  {
    id: 'item-8',
    src: 'https://videos.pexels.com/video-files/2306150/2306150-hd_1920_1080_30fps.mp4',
    type: 'video',
    genre: 'classical',
    instrument: 'piano',
    artist: 'Hannah Bennet',
  },

  {
    id: 'item-7',
    src: 'https://videos.pexels.com/video-files/2017436/2017436-hd_1920_1080_24fps.mp4',
    type: 'video',
    genre: 'jazz',
    instrument: 'piano',
    artist: 'Liam Bennet',
  },

  {
    id: 'item-5',
    src: 'https://videos.pexels.com/video-files/855880/855880-hd_1920_1080_25fps.mp4',
    type: 'video',
    genre: 'classical',
    instrument: 'violin',
    artist: 'Tom Martinez',
  },

  {
    id: 'item-6',
    src: 'https://videos.pexels.com/video-files/3326187/3326187-hd_1920_1080_24fps.mp4',
    type: 'video',
    genre: 'rock',
    instrument: 'drums',
    artist: 'Elliot Smith ',
  },
  {
    id: 'item-6',
    src: 'https://videos.pexels.com/video-files/2836275/2836275-uhd_2560_1440_24fps.mp4',
    type: 'video',
    genre: 'jazz',
    instrument: 'guitar',
    artist: 'Connor Martinez',
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
  <div className="tt-chip-wrapper">
    <button
      className={`tt-chip ${likedMap[gKey] ? 'active' : ''}`}
      onClick={() => record('genre', item.genre, item.id)}
    ><FaMusic size={22} /></button>
    <span>Genre</span>
  </div>
  <div className="tt-chip-wrapper">
    <button
      className={`tt-chip ${likedMap[iKey] ? 'active' : ''}`}
      onClick={() => record('instrument', item.instrument, item.id)}
    ><FaGuitar size={22} /></button>
    <span>Instrument</span>
  </div>
  <div className="tt-chip-wrapper">
    <button
      className={`tt-chip ${likedMap[aKey] ? 'active' : ''}`}
      onClick={() => record('artist', item.artist, item.id)}
    ><FaUser size={22} /></button>
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
