import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Nav from '@/common/Nav/Nav.jsx'
import Footer from '@/common/Footer/Footer.jsx'
import CustomCursor from '@/common/CustomCursor/CustomCursor.jsx'
import PageLoader from '@/common/PageLoader/PageLoader.jsx'
import Home from '@/pages/Home/Home.jsx'
import Blog from '@/pages/Blog/Blog.jsx'
import BlogPost from '@/pages/BlogPost/BlogPost.jsx'
import Projects from '@/pages/Projects/Projects.jsx'
import ProjectDetail from '@/pages/ProjectDetail/ProjectDetail.jsx'
import Favorites from '@/pages/Favorites/Favorites.jsx'
import Guestbook from '@/pages/Guestbook/Guestbook.jsx'
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
  const location = useLocation()

  // 路由切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

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
        {loaderDone && (
          <Routes>
            <Route path="/" element={<Home isMobile={isMobile} />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/guestbook" element={<Guestbook />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}
