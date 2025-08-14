import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './profile.css'

// Musicians data with expanded profile information
const MUSICIANS = [
  {
    id: 1,
    name: 'Jake Smith',
    age: '24',
    instrument: 'Trumpet, Guitar',
    bio: 'Plays trumpet, guitar, and sings. Enjoys jazz, rock, piano, trumpet, and acoustic.',
    genres: ['jazz', 'rock', 'acoustic'],
    profileImage: null,
    videoId: '-MmVRiUjhOM' // Trumpet Jazz
  },
  {
    id: 2,
    name: 'Ava Martinez',
    age: '22',
    instrument: 'Acoustic Guitar, Harmonica',
    bio: 'Singer-songwriter with a love for folk and indie. Plays acoustic guitar and harmonica.',
    genres: ['folk', 'indie', 'acoustic'],
    profileImage: null,
    videoId: 'ft8HsrPBbg4' // Blues Harmonica
  },
  {
    id: 3,
    name: 'Liam Chen',
    age: '27',
    instrument: 'Piano, Bass',
    bio: 'Jazz pianist and bassist who also dabbles in classical composition.',
    genres: ['jazz', 'classical'],
    profileImage: null,
    videoId: 'AxAzsM6X-mQ' // Jazz Piano
  },
  {
    id: 4,
    name: 'Sophie Davis',
    age: '25',
    instrument: 'Drums, Percussion',
    bio: 'Drummer and percussionist with a passion for funk, R&B, and world rhythms.',
    genres: ['funk', 'r&b', 'world'],
    profileImage: null,
    videoId: 'VUxb_URO-Dc' // Funk drums
  },
  {
    id: 5,
    name: 'Ethan Roberts',
    age: '26',
    instrument: 'Electric Guitar',
    bio: 'Electric guitarist who enjoys blues rock, psychedelic jams, and improvisation.',
    genres: ['blues', 'rock', 'psychedelic'],
    profileImage: null,
    videoId: 'plgU6I_HtZQ' // Electric Guitar Rock
  },
  {
    id: 6,
    name: 'Nina Patel',
    age: '23',
    instrument: 'Violin',
    bio: 'Classically trained violinist who blends traditional Indian music with pop.',
    genres: ['classical', 'indian', 'pop'],
    profileImage: null,
    videoId: 'hEc5EI6uhUc' // Indian Classical Violin
  },
  {
    id: 7,
    name: 'Marcus Johnson',
    age: '28',
    instrument: 'Vocals, Beat-making',
    bio: 'Hip-hop MC and spoken word poet with a love for jazz samples and beat-making.',
    genres: ['hip-hop', 'jazz', 'spoken word'],
    profileImage: null,
    videoId: 'zaXMjDZT7e8' // Jazz Vocals
  },
  {
    id: 8,
    name: 'Claire Thompson',
    age: '24',
    instrument: 'Vocals, Keyboard',
    bio: 'Pop vocalist and keyboardist with a flair for musical theatre.',
    genres: ['pop', 'musical theatre'],
    profileImage: null,
    videoId: 'I52EJ-ihVGk' // Musical Theatre Vocals
  },
  {
    id: 9,
    name: 'Noah Kim',
    age: '25',
    instrument: 'Synthesizer, Electronic',
    bio: 'Experimental electronic producer and modular synth performer.',
    genres: ['electronic', 'experimental'],
    profileImage: null,
    videoId: 'Vk-v5NuVbIc' // Electronic Synthesizer
  },
  {
    id: 10,
    name: 'Isabella Rossi',
    age: '29',
    instrument: 'Vocals',
    bio: 'Opera-trained soprano who moonlights as a rock frontwoman.',
    genres: ['opera', 'rock', 'classical'],
    profileImage: null,
    videoId: '1FkowGRLjzo' // Opera Vocals
  },
  {
    id: 11,
    name: 'Oliver Brooks',
    age: '26',
    instrument: 'Guitar, Banjo',
    bio: 'Folk guitarist and banjo player who writes storytelling ballads inspired by travel.',
    genres: ['folk', 'acoustic', 'storytelling'],
    profileImage: null,
    videoId: '2oeZS40DlWE' // Folk Vocals
  },
  {
    id: 12,
    name: 'Maya Hernandez',
    age: '27',
    instrument: 'Vocals',
    bio: 'Soul and R&B vocalist with gospel roots, often performs with a live backing band.',
    genres: ['soul', 'r&b', 'gospel'],
    profileImage: null,
    videoId: 'm_zyYSDbmvA' // Soul Vocals
  },
  {
    id: 13,
    name: 'Julian Carter',
    age: '30',
    instrument: 'Harmonica, Slide Guitar',
    bio: 'Blues harmonica player and slide guitarist with a love for delta blues traditions.',
    genres: ['blues', 'delta blues'],
    profileImage: null,
    videoId: 'k7yg5Gn31kg' // Blues Vocals
  },
  {
    id: 14,
    name: 'Harper Lee',
    age: '24',
    instrument: 'Cello',
    bio: 'Cellist who performs both in classical ensembles and indie-folk collaborations.',
    genres: ['classical', 'indie-folk'],
    profileImage: null,
    videoId: '5UqpV3rBklc' // Indie Cello
  },
  {
    id: 15,
    name: 'Samuel Wright',
    age: '25',
    instrument: 'Bass',
    bio: 'Funk bassist and groove composer, known for high-energy stage presence.',
    genres: ['funk', 'groove'],
    profileImage: null,
    videoId: 'q44kbxmkwKg' // Funk Bass
  },
  {
    id: 16,
    name: 'Zara Ahmed',
    age: '23',
    instrument: 'Vocals, Acoustic Guitar',
    bio: 'Singer-songwriter blending Middle Eastern melodies with acoustic pop.',
    genres: ['middle eastern', 'acoustic', 'pop'],
    profileImage: null,
    videoId: 'M_RX16B0r5M' // Pop Vocals
  },
  {
    id: 17,
    name: 'Logan Mitchell',
    age: '26',
    instrument: 'Drums',
    bio: 'Rock drummer with a background in punk and alternative, known for dynamic fills.',
    genres: ['rock', 'punk', 'alternative'],
    profileImage: null,
    videoId: '2D5YAeZuLKs' // Punk Drums
  },
  {
    id: 18,
    name: 'Emily Foster',
    age: '28',
    instrument: 'Saxophone',
    bio: 'Jazz saxophonist who also arranges big band charts and smooth lounge sets.',
    genres: ['jazz', 'big band', 'lounge'],
    profileImage: null,
    videoId: 'iHik50eYi2s' // Jazz Saxophone
  },
  {
    id: 19,
    name: 'Caleb Nguyen',
    age: '24',
    instrument: 'DJ Equipment, Production',
    bio: 'EDM DJ and producer specializing in house, trance, and remixes of pop hits.',
    genres: ['edm', 'house', 'trance'],
    profileImage: null,
    videoId: 'Vk-v5NuVbIc' // Electronic Synthesizer
  },
  {
    id: 20,
    name: 'Victoria Lane',
    age: '25',
    instrument: 'Vocals, Piano',
    bio: 'Broadway-inspired singer and pianist who often covers show tunes and movie soundtracks.',
    genres: ['broadway', 'show tunes', 'pop'],
    profileImage: null,
    videoId: 'nzqS-69301Q' // Broadway Vocals
  },
  {
    id: 21,
    name: 'Damien Cole',
    age: '29',
    instrument: 'Vocals, Rhythm Guitar',
    bio: 'Blues-rock vocalist and rhythm guitarist with a gritty, soulful sound.',
    genres: ['blues', 'rock'],
    profileImage: null,
    videoId: 'd_dFw6NzUt8' // Rock Vocals
  },
  {
    id: 22,
    name: 'Elena Petrova',
    age: '26',
    instrument: 'Piano',
    bio: 'Classical pianist who blends romantic-era compositions with modern cinematic scores.',
    genres: ['classical', 'cinematic'],
    profileImage: null,
    videoId: 'CzsnXrygTmk' // Classical Piano
  },
  {
    id: 23,
    name: 'Kai Rivers',
    age: '23',
    instrument: 'Acoustic Guitar',
    bio: 'Acoustic indie-folk singer with a penchant for fingerpicking and lyrical storytelling.',
    genres: ['indie-folk', 'acoustic'],
    profileImage: null,
    videoId: 'PzumNALIFWM' // Indie Vocals
  },
  {
    id: 24,
    name: 'Priya Sharma',
    age: '27',
    instrument: 'Tabla',
    bio: 'Tabla player who fuses traditional Indian rhythms with jazz and fusion ensembles.',
    genres: ['indian', 'jazz', 'fusion'],
    profileImage: null,
    videoId: '_NXkaxaZ03g' // Indian Tabla
  },
  {
    id: 25,
    name: 'Gabriel Torres',
    age: '28',
    instrument: 'Trumpet, Flugelhorn',
    bio: 'Trumpeter and flugelhorn player known for Latin jazz and salsa-inspired performances.',
    genres: ['latin jazz', 'salsa'],
    profileImage: null,
    videoId: 'yQemz-KaytQ' // Trumpet Salsa
  },
  {
    id: 26,
    name: 'Sienna Clark',
    age: '24',
    instrument: 'Vocals, Synthesizer',
    bio: 'Dream-pop vocalist and synth player who creates ethereal, ambient soundscapes.',
    genres: ['dream-pop', 'ambient'],
    profileImage: null,
    videoId: '5fJnwSGNyow' // Ambient Percussion
  },
  {
    id: 27,
    name: 'Owen Bennett',
    age: '31',
    instrument: 'Mandolin',
    bio: 'Bluegrass mandolinist with roots in Appalachian folk traditions.',
    genres: ['bluegrass', 'appalachian folk'],
    profileImage: null,
    videoId: 'xLQCDJkPgr8' // Bluegrass Mandolin
  },
  {
    id: 28,
    name: 'Lila Morgan',
    age: '22',
    instrument: 'Ukulele, Vocals',
    bio: 'Singer-songwriter who pairs ukulele melodies with heartfelt, personal lyrics.',
    genres: ['acoustic', 'indie'],
    profileImage: null,
    videoId: 'yhkwkGM_91g' // Indie Ukulele
  },
  {
    id: 29,
    name: 'Adrian Wu',
    age: '26',
    instrument: 'Experimental Percussion',
    bio: 'Experimental percussionist exploring found-object instruments and rhythmic looping.',
    genres: ['experimental', 'ambient'],
    profileImage: null,
    videoId: 'cRkr6-amhzI' // Experimental Percussion
  },
  {
    id: 30,
    name: 'Hannah Brooks',
    age: '25',
    instrument: 'Vocals, Acoustic Guitar',
    bio: 'Country vocalist and acoustic guitarist inspired by 90s Nashville sound.',
    genres: ['country', 'acoustic'],
    profileImage: null,
    videoId: 'udrFVfObP6Y' // Country Vocals
  }
]

function MusicianProfile({ musician }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="profile-container">
      <div className="profile-header" style={{ marginTop: '3rem' }}>
        <h1>{musician.name}'s Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-fields">
          <p>
            <strong>Name:</strong>
            <span className="profile-value"> {musician.name}</span>
          </p>

          <p>
            <strong>Age:</strong>
            <span className="profile-value"> {musician.age}</span>
          </p>

          <p>
            <strong>Instrument:</strong>
            <span className="profile-value"> {musician.instrument}</span>
          </p>

          <p>
            <strong>Genres:</strong>
            <span className="profile-value"> {musician.genres.join(', ')}</span>
          </p>

          <p>
            <strong>Bio:</strong>
          </p>
          <div className="profile-bio">
            {musician.bio}
          </div>
        </div>

        <div className="profile-upload">
          <p><strong>Performance Videos:</strong></p>
          <div className="media-preview">
            {musician.videoId ? (
              <div className="media-card">
                <div className="media-name">Featured Performance</div>
                <div style={{ 
                  position: 'relative',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                  overflow: 'hidden',
                  marginTop: '1rem',
                  borderRadius: '8px'
                }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${musician.videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&mute=0&loop=1&playlist=${musician.videoId}&playsinline=1&fs=0&disablekb=1&iv_load_policy=3&cc_load_policy=0`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px',
                      pointerEvents: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${musician.name} Performance`}
                  />
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  Watch {musician.name} perform {musician.instrument.toLowerCase()} in their signature style.
                </p>
              </div>
            ) : (
              <div className="media-card">
                <div className="media-name">No media uploaded yet</div>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  This musician hasn't uploaded any performance videos or audio yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Musicians() {
  const [selectedMusician, setSelectedMusician] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  // Check if we navigated here with a specific musician to show
  useEffect(() => {
    if (location.state?.selectedMusician) {
      setSelectedMusician(location.state.selectedMusician)
    }
  }, [location.state])

  const filteredMusicians = MUSICIANS.filter(musician =>
    musician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    musician.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
    musician.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (selectedMusician) {
    return (
      <div>
        <MusicianProfile musician={selectedMusician} />
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          left: '1rem', 
          zIndex: 1000 
        }}>
          <button 
            className="primary-button" 
            onClick={() => setSelectedMusician(null)}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            ← Back to All Musicians
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Musicians Directory</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Discover {MUSICIANS.length} talented musicians in the Ensembley community
        </p>
      </div>

      <div className="profile-content">
        <div className="profile-fields" style={{ marginBottom: '2rem' }}>
          <p><strong>Search Musicians:</strong></p>
          <input
            type="text"
            placeholder="Search by name, instrument, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="profile-input"
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>

        <div className="musicians-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem',
          width: '100%' 
        }}>
          {filteredMusicians.map(musician => (
            <div 
              key={musician.id} 
              className="media-card" 
              style={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '2px solid transparent'
              }}
              onClick={() => setSelectedMusician(musician)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.boxShadow = '0 4px 16px rgba(76,110,245,0.15)'
                e.target.style.borderColor = '#4c6ef5'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 2px 8px rgba(76,110,245,0.10)'
                e.target.style.borderColor = 'transparent'
              }}
            >
              <div className="media-name">{musician.name}</div>
              <p style={{ margin: '0.5rem 0', color: '#4c6ef5', fontWeight: '600' }}>
                {musician.instrument}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                <strong>Genres:</strong> {musician.genres.join(', ')}
              </p>
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                color: '#555', 
                fontSize: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {musician.bio}
              </p>
              <button 
                className="primary-button" 
                style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.8rem', 
                  padding: '0.5rem 1rem',
                  width: '100%'
                }}
              >
                View Full Profile
              </button>
            </div>
          ))}
        </div>

        {filteredMusicians.length === 0 && (
          <div className="media-card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#666' }}>No musicians found matching "{searchTerm}"</p>
            <button 
              className="primary-button"
              onClick={() => setSearchTerm('')}
              style={{ marginTop: '1rem' }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Musicians
export { MUSICIANS }
