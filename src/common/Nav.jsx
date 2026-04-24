import { useState, useEffect } from 'react'
import './Nav.css'

const navLinks = [
  { label: '首页', href: '#' },
  { label: '技能', href: '#skills' },
  { label: '项目', href: '#projects' },
  { label: '联系', href: '#about' },
]

export default function Nav({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const sections = ['skills', 'projects', 'about']
    const observer = new IntersectionObserver(
      (entries) => {
        let hasActiveSection = false
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            hasActiveSection = true
          }
        })
        if (!hasActiveSection && window.scrollY < 100) {
          setActiveSection('')
        }
      },
      { threshold: 0.2, rootMargin: '-100px 0px -50% 0px' }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('')
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="/" className="nav__logo">
        <span className="nav__logo-icon">S</span>
        <span className="nav__logo-text">Shea</span>
      </a>

      <nav className="nav__links">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`nav__link ${(link.href === '#' && activeSection === '') || activeSection === link.href.slice(1) ? 'active' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a href="#about" className="nav__contact-btn">联系我</a>

      {/* 白/夜模式切换按钮 */}
      <button
        className="nav__theme-btn"
        onClick={toggleTheme}
        aria-label={theme === '' ? '切换到亮色模式' : '切换到暗色模式'}
        title={theme === '' ? '切换到亮色模式' : '切换到暗色模式'}
      >
        {theme === '' ? (
          // 月亮图标（当前是暗色/原设计，点击切换到亮色）
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // 太阳图标（当前是亮色，点击切换到暗色/原设计）
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
          <a
            key={link.label}
            href={link.href}
            className={`nav__mobile-link ${(link.href === '#' && activeSection === '') || activeSection === link.href.slice(1) ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a href="#about" className="nav__mobile-cta" onClick={() => setMenuOpen(false)}>联系我</a>
      </div>
    </header>
  )
}
