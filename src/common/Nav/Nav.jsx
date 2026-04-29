import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Nav.css'

const navLinks = [
  { label: '首页', to: '/' },
  { label: '博客', to: '/blog' },
  { label: '项目', to: '/projects' },
  { label: '收藏', to: '/favorites' },
  { label: '留言', to: '/guestbook' },
]

export default function Nav({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // 路由切换时关闭移动端菜单
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <NavLink to="/" className="nav__logo">
        <span className="nav__logo-icon">S</span>
        <span className="nav__logo-text">Shea</span>
      </NavLink>

      <nav className="nav__links">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/guestbook" className="nav__contact-btn">联系我</NavLink>

      {/* 白/夜模式切换按钮 */}
      <button
        className="nav__theme-btn"
        onClick={toggleTheme}
        aria-label={theme === '' ? '切换到亮色模式' : '切换到暗色模式'}
        title={theme === '' ? '切换到亮色模式' : '切换到暗色模式'}
      >
        {theme === '' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>

      <button
        className={`nav__menu-btn ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <div className={`nav__mobile ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `nav__mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/guestbook" className="nav__mobile-cta" onClick={() => setMenuOpen(false)}>联系我</NavLink>
      </div>
    </header>
  )
}
