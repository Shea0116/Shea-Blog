import { useState, useEffect, useRef, useCallback } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import About from './components/About.jsx'
import Footer from './components/Footer.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import './App.css'

export default function App() {
  const [mouse, setMouse] = useState({ x: -999, y: -999 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const rafRef = useRef(null)
  const pendingMouse = useRef({ x: -999, y: -999 })

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

  // Scroll progress
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
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
      {!isMobile && <CustomCursor mouse={mouse} />}
      <Nav />
      <main>
        <Hero isMobile={isMobile} />
        <Marquee />
        <Skills />
        <Projects />
        <About />
      </main>
      <Footer />
    </div>
  )
}
