import { useEffect, useState, useRef, useCallback } from 'react'
import './Hero.css'
import { getAbout } from '@/api/posts'
import type { About } from '@/api/types'
import MagneticButton from '@/common/MagneticButton/MagneticButton'

interface CharRevealProps {
  text: string
  baseDelay?: number
  className?: string
}

interface HeroProps {
  isMobile: boolean
}

export function CharReveal({ text, baseDelay = 0, className = '' }: CharRevealProps) {
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

// 打字机效果组件 - 多行轮播
function TypewriterText({ lines, delay = 0, className = '' }: { lines: string[]; delay?: number; className?: string }) {
  const [displayText, setDisplayText] = useState('')
  const [lineIndex, setLineIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    const currentLine = lines[lineIndex]

    if (phase === 'typing') {
      let index = 0
      const interval = setInterval(() => {
        if (index <= currentLine.length) {
          setDisplayText(currentLine.slice(0, index))
          index++
        } else {
          clearInterval(interval)
          setPhase('pausing')
        }
      }, 70)
      return () => clearInterval(interval)
    }

    if (phase === 'pausing') {
      const timer = setTimeout(() => setPhase('deleting'), 2000)
      return () => clearTimeout(timer)
    }

    if (phase === 'deleting') {
      let index = currentLine.length
      const interval = setInterval(() => {
        if (index >= 0) {
          setDisplayText(currentLine.slice(0, index))
          index--
        } else {
          clearInterval(interval)
          setLineIndex((prev) => (prev + 1) % lines.length)
          setPhase('typing')
        }
      }, 35)
      return () => clearInterval(interval)
    }
  }, [started, phase, lineIndex, lines])

  return (
    <span className={className}>
      {displayText}
      <span className="typewriter-cursor">|</span>
    </span>
  )
}

// 浮动装饰元素
function FloatingElements() {
  return (
    <div className="hero__floating-elements" aria-hidden="true">
      <div className="floating-element floating-element--1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="floating-element floating-element--2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>
      <div className="floating-element floating-element--3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <div className="floating-element floating-element--4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
      <div className="floating-element floating-element--5">
        <span className="code-snippet">&lt;/&gt;</span>
      </div>
      <div className="floating-element floating-element--6">
        <span className="code-snippet">{ }</span>
      </div>
    </div>
  )
}

// 技能标签云
function SkillTags() {
  const skills = ['React', 'Vue3', 'Node.js', 'JAVA', 'Python']

  return (
    <div className="hero__skill-tags">
      {skills.map((skill, index) => (
        <span
          key={skill}
          className="skill-tag"
          style={{ animationDelay: `${1.5 + index * 0.1}s` }}
        >
          {skill}
        </span>
      ))}
    </div>
  )
}

// 统计数据展示
function StatsDisplay({ about }: { about?: About }) {
  const stats = [
    { value: about?.experience || '3', label: '年经验', suffix: '+' },
    { value: '8', label: '项目交付', suffix: '+' },
    { value: '150', label: '组件治理', suffix: '+' },
  ]

  return (
    <div className="hero__stats">
      {stats.map((stat, index) => (
        <div key={stat.label} className="hero__stat" style={{ animationDelay: `${1.2 + index * 0.15}s` }}>
          <span className="hero__stat-value">
            {stat.value}{stat.suffix}
          </span>
          <span className="hero__stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Hero({ isMobile }: HeroProps) {
  const [loaded, setLoaded] = useState(false)
  const [about, setAbout] = useState<About>()
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAbout().then(setAbout)
  }, [])

  // 组件挂载时即触发入场动画
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  // 鼠标视差 + 光标追踪光效
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!heroRef.current || isMobile) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height

    // 标题视差
    if (titleRef.current) {
      titleRef.current.style.transform = `translate(${x * 15}px, ${y * 15}px)`
    }

    // 光标追踪光效
    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY - rect.top}px, rgba(129, 140, 248, 0.06), transparent 40%)`
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) return
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove, isMobile])

  return (
    <section className="hero" ref={heroRef}>
      {/* 背景光晕 - 增强版 */}
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        <div className="hero__orb hero__orb--4" />
      </div>

      {/* 网格背景 */}
      <div className="hero__grid" />

      {/* 光标追踪光效 */}
      <div className="hero__spotlight" ref={spotlightRef} />

      {/* 浮动装饰元素 */}
      <FloatingElements />

      {/* 装饰性轮廓文字 */}
      <div className="hero__ghost" aria-hidden="true">SHEA</div>

      <div className={`hero__content ${loaded ? 'loaded' : ''}`}>
        {/* 状态徽章 */}
        <div className={`hero__badge ${loaded ? 'show' : ''}`}>
          <span className="hero__badge-dot" />
          <span>Open to opportunities</span>
        </div>

        {/* 问候语 */}
        <p className={`hero__eyebrow ${loaded ? 'show' : ''}`}>Halo, I'm</p>

        {/* 主标题 - 带视差效果 */}
        <div className="hero__title-wrap" ref={titleRef}>
          <h1 className="hero__title hero__title--en">
            <span className="title-gradient">Shea</span>
          </h1>
          <h1 className="hero__title hero__title--cn">
            <CharReveal text="贤" baseDelay={0.20} />
          </h1>
        </div>

        {/* 动态副标题 - 多行轮播打字机 */}
        <div className={`hero__dynamic-sub ${loaded ? 'show' : ''}`}>
          <TypewriterText
            lines={[
              'Frontend Developer · 创造优雅的数字体验',
              'Full Stack Developer · Node.js / Python / Java',
              '跨端开发者 · React / Vue / HarmonyOS',
              '工程化实践者 · 追求极致的用户体验',
              '25岁 · Base北京',
            ]}
            delay={800}
            className="hero__typewriter"
          />
        </div>

        {/* 技能标签云 */}
        <SkillTags />

        {/* 分隔线动画 */}
        <div className={`hero__rule ${loaded ? 'show' : ''}`} />

        {/* 统计数据 */}
        <StatsDisplay about={about} />

        {/* CTA 按钮 - 使用磁吸效果 */}
        <div className={`hero__cta ${loaded ? 'show' : ''}`}>
          <MagneticButton href="#projects" className="magnetic-button--primary" strength={0.4}>
            <span>查看项目</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </MagneticButton>
          <MagneticButton href="#about" className="magnetic-button--ghost" strength={0.4}>
            了解更多
          </MagneticButton>
        </div>
      </div>

      {/* 滚动指示器 */}
      <div className={`hero__scroll ${loaded ? 'show' : ''}`}>
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>

      {/* 角落装饰 */}
      <div className="hero__corner hero__corner--tl" />
      <div className="hero__corner hero__corner--tr" />
      <div className="hero__corner hero__corner--bl" />
      <div className="hero__corner hero__corner--br" />
    </section>
  )
}
