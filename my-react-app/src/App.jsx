import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Profile from './profile.jsx'
import Scrolling from './scrolling.jsx'
import Results from './results.jsx'
import Interactions from './interactions.jsx'
import Musicians from './musicians.jsx'
import Navigation from './navigation.jsx'

function Home() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  const handleGetStarted = () => {
    setIsExiting(true)
    // Wait for animation to complete before navigating
    setTimeout(() => {
      navigate('/profile')
    }, 800) // Animation duration
  }

  return (
    <div className={`app-container animated-background ${isExiting ? 'page-exit' : ''}`}>
      <main className="app-main">
        <section className="intro">
          <h2 className="welcome-title">Welcome to Ensembley</h2>
          <p className="welcome-subtitle">Find collaborators, discover jam sessions, and build your musical crew.</p>
          <button className="primary-button welcome-button" onClick={handleGetStarted}>
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
