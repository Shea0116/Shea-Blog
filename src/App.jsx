import { useState, useEffect, useRef, useCallback } from 'react'
import Nav from './common/Nav.jsx'
import Hero from './sections/Hero/Hero.jsx'
import Marquee from './sections/Marquee/Marquee.jsx'
import Skills from './sections/Skills/Skills.jsx'
import Projects from './sections/Projects/Projects.jsx'
import About from './sections/About/About.jsx'
import Footer from './common/Footer.jsx'
import CustomCursor from './common/CustomCursor.jsx'
import PageLoader from './common/PageLoader.jsx'
import './App.css'

export default function App() {
  const [loaderDone, setLoaderDone] = useState(false)
  const [mouse, setMouse] = useState({ x: -999, y: -999 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || ''
  })
  const rafRef = useRef(null)
  const pendingMouse = useRef({ x: -999, y: -999 })

  // 主题切换
  useEffect(() => {
    if (theme === '') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === '' ? 'dark' : '')
  }, [])

  const handleMouseMove = useCallback((e) => {
    pendingMouse.current = { x: e.clientX, y: e.clientY }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setMouse({ ...pendingMouse.current })
        rafRef.current = null
      })
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleMouseMove])

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="app">
      <PageLoader onComplete={() => setLoaderDone(true)} />
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
      {!isMobile && <CustomCursor mouse={mouse} />}
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero isMobile={isMobile} loaderDone={loaderDone} />
        <Marquee />
        <Skills />
        <Projects />
        <About />
      </main>
      <Footer />
    </div>
  )
}
