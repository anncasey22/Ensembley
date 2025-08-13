import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Profile from './profile.jsx'
import Scrolling from './scrolling.jsx'
import Results from './results.jsx'
import Interactions from './interactions.jsx'
import Musicians from './musicians.jsx'
import Navigation from './navigation.jsx'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ensembley</h1>
        <p>Your space to connect, discover, and share music.</p>
      </header>

      <main className="app-main">
        <section className="intro">
          <h2>Welcome to Ensembley</h2>
          <p>Find collaborators, discover jam sessions, and build your musical crew.</p>
          <button className="primary-button" onClick={() => navigate('/profile')}>
            Get Started
          </button>
        </section>
      </main>
    </div>
  )
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} /> {/* home route */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/scrolling" element={<Scrolling />} />
        <Route path="/results" element={<Results />} />
        <Route path="/interactions" element={<Interactions />} />
        <Route path="/musicians" element={<Musicians />} /> {/* musicians directory */}
        <Route path="*" element={<Profile />} /> {/* default route */}
      </Routes>
      <Navigation />
    </div>
  )
}

export default App
