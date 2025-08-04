import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ensembley</h1>
        <p>Your space to connect, create, and share music.</p>
      </header>
      <main className="app-main">
        <section className="intro">
          <h2>Welcome to Ensembley</h2>
          <p>Find collaborators, discover jam sessions, and build your musical crew.</p>
          <button className="primary-button">Get Started</button>
        </section>
      </main>
    </div>
  )
}


export default App
