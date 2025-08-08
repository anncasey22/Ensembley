import { NavLink } from 'react-router-dom'
import './navigation.css'

function Navigation() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
        profile
      </NavLink>
      <NavLink to="/scrolling" className={({ isActive }) => isActive ? 'active' : ''}>
        scrolling
      </NavLink>
      <NavLink to="/results" className={({ isActive }) => isActive ? 'active' : ''}>
        results
      </NavLink>
    </nav>
  )
}

export default Navigation
