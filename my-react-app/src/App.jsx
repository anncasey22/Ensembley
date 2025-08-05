import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Profile from './profile.jsx'

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App
