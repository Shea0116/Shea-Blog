import { useRef, useEffect, useState } from 'react'
import './Hero.css'

export default function Hero({ isMobile }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="hero">
      {/* Animated gradient orbs background */}
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
      </div>

      {/* Grid pattern */}
      <div className="hero__grid" />

      <div className="hero__content">
        {/* Status badge */}
        <div className={`hero__badge ${loaded ? 'show' : ''}`}>
          <span className="hero__badge-dot" />
          <span>Open to opportunities</span>
        </div>

        {/* Title */}
        <div className="hero__title-wrap">
          <h1 className={`hero__title hero__title--en ${loaded ? 'show' : ''}`}>
            <span>Halo, I'm </span>
            <em>Shea</em>
          </h1>
          <h1 className={`hero__title hero__title--cn hero__title--small ${loaded ? 'show' : ''}`}>
            <span>您好，我是 </span>
            <em>刘庚贤</em>
          </h1>
        </div>

        {/* Subtitle */}
        <p className={`hero__sub ${loaded ? 'show' : ''}`}>
          Frontend Developer · 3年经验 · 北京
        </p>

        {/* CTA buttons */}
        <div className={`hero__cta ${loaded ? 'show' : ''}`}>
          <a href="#projects" className="hero__btn hero__btn--primary">
            <span>查看项目</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#about" className="hero__btn hero__btn--ghost">
            了解更多
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`hero__scroll ${loaded ? 'show' : ''}`}>
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
        <span>Scroll</span>
      </div>
    </section>
  )
}
