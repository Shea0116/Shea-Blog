import { useState, useEffect } from 'react'
import './Nav.css'

const navLinks = [
  { label: '关于', href: '#about' },
  { label: '技能', href: '#skills' },
  { label: '项目', href: '#projects' },
  { label: '联系', href: '#about' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const sections = ['about', 'skills', 'projects']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
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
            className={`nav__link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a href="#about" className="nav__contact-btn">联系我</a>

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
            className={`nav__mobile-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
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
