import { useEffect, useState } from 'react'
import './Hero.css'

function CharReveal({ text, baseDelay = 0, className = '' }) {
  return (
    <span className={`char-group ${className}`}>
      {[...text].map((ch, i) => (
        <span key={i} className="char-clip">
          <span
            className="char"
            style={{ transitionDelay: `${(baseDelay + i * 0.048).toFixed(3)}s` }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        </span>
      ))}
    </span>
  )
}

export default function Hero({ isMobile, loaderDone }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaderDone) return
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [loaderDone])

  const age = new Date().getFullYear() - 2001

  return (
    <section className="hero">
      {/* Background orbs */}
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
      </div>

      {/* Grid */}
      <div className="hero__grid" />

      {/* Decorative ghost outline */}
      <div className="hero__ghost" aria-hidden="true">SHEA</div>

      <div className={`hero__content ${loaded ? 'loaded' : ''}`}>
        {/* Status badge */}
        <div className={`hero__badge ${loaded ? 'show' : ''}`}>
          <span className="hero__badge-dot" />
          <span>Open to opportunities</span>
        </div>

        {/* Eyebrow */}
        <p className={`hero__eyebrow ${loaded ? 'show' : ''}`}>Halo, I'm</p>

        {/* Giant name — character split */}
        <div className="hero__title-wrap">
          <h1 className="hero__title hero__title--en">
            <CharReveal text="Shea" baseDelay={0.08} />
          </h1>
          <h1 className="hero__title hero__title--cn">
            <CharReveal text="刘庚贤" baseDelay={0.32} />
          </h1>
        </div>

        {/* Animated rule */}
        <div className={`hero__rule ${loaded ? 'show' : ''}`} />

        {/* Subtitle */}
        <p className={`hero__sub ${loaded ? 'show' : ''}`}>
          Frontend Developer&nbsp;&nbsp;·&nbsp;&nbsp;{age}岁&nbsp;&nbsp;·&nbsp;&nbsp;3年经验&nbsp;&nbsp;·&nbsp;&nbsp;北京
        </p>

        {/* CTA */}
        <div className={`hero__cta ${loaded ? 'show' : ''}`}>
          <a href="#projects" className="hero__btn hero__btn--primary">
            <span>查看项目</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#about" className="hero__btn hero__btn--ghost">
            了解更多
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`hero__scroll ${loaded ? 'show' : ''}`}>
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
