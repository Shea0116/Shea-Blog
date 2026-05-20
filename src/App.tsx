import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AppendixProvider } from '@/context/AppendixContext'
import Nav from '@/common/Nav/Nav'
import Footer from '@/common/Footer/Footer'
import CustomCursor from '@/common/CustomCursor/CustomCursor'
import PageLoader from '@/common/PageLoader/PageLoader'
import ParticleBackground from '@/common/ParticleBackground/ParticleBackground'
import ThemeTransition from '@/common/ThemeTransition/ThemeTransition'
import { ErrorBoundary } from '@/common/ErrorBoundary/ErrorBoundary'
import Home from '@/pages/Home/Home'
import Blog from '@/pages/Blog/Blog'
import BlogPost from '@/pages/BlogPost/BlogPost'
import Projects from '@/pages/Projects/Projects'
import ProjectDetail from '@/pages/ProjectDetail/ProjectDetail'
import Favorites from '@/pages/Favorites/Favorites'
import Guestbook from '@/pages/Guestbook/Guestbook'
import './App.css'

export default function App() {
  const [loaderDone, setLoaderDone] = useState(false)
  const [mouse, setMouse] = useState({ x: -999, y: -999 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || ''
  })
  const rafRef = useRef<number | null>(null)
  const pendingMouse = useRef({ x: -999, y: -999 })
  const location = useLocation()

  // 路由切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // 主题切换 - 添加平滑过渡动画
  const toggleTheme = useCallback(() => {
    const html = document.documentElement
    html.classList.add('theme-transition')

    // 短暂延迟后切换主题，让用户看到过渡效果
    setTimeout(() => {
      setTheme(prev => {
        const newTheme = prev === '' ? 'dark' : ''
        if (newTheme === '') {
          html.removeAttribute('data-theme')
        } else {
          html.setAttribute('data-theme', newTheme)
        }
        localStorage.setItem('theme', newTheme)
        return newTheme
      })
    }, 50)

    // 动画结束后移除过渡类
    setTimeout(() => {
      html.classList.remove('theme-transition')
    }, 550)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
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

  // 初始化主题
  useEffect(() => {
    if (theme === '') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [])

  return (
    <ThemeTransition isDark={theme === 'dark'}>
      <div className="app">
        <PageLoader onComplete={() => setLoaderDone(true)} />
        <ParticleBackground />
        <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
        {!isMobile && <CustomCursor mouse={mouse} />}
        <Nav theme={theme} toggleTheme={toggleTheme} />
        <main>
          {loaderDone && (
            <AppendixProvider>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home isMobile={isMobile} />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:slug" element={<ProjectDetail />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/guestbook" element={<Guestbook />} />
                </Routes>
              </ErrorBoundary>
            </AppendixProvider>
          )}
        </main>
        <Footer />
      </div>
    </ThemeTransition>
  )
}
