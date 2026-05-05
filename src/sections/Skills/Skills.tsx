import React, { useEffect, useRef, useState, useCallback } from 'react'
import './Skills.css'

interface Stat {
  value: number
  suffix: string
  label: string
}

interface Skill {
  id: string
  icon: string
  title: string
  desc: string
  stats: Stat[]
}

interface AnimatedNumberProps {
  value: number
  suffix: string
  visible: boolean
}

interface SkillCardProps {
  skill: Skill
  index: number
}

const skills: Skill[] = [
  {
    id: 'FE',
    icon: '🎨',
    title: '前端开发',
    desc: '精通 React / Vue 全家桶，熟练使用 TypeScript 编写类型安全代码，擅长组件化架构设计与性能优化',
    stats: [
      { value: 3, suffix: '+', label: '年经验' },
      { value: 8, suffix: '+', label: '项目交付' },
      { value: 150, suffix: '+', label: '组件治理' },
    ],
  },
  {
    id: 'HB',
    icon: '📱',
    title: '跨端开发',
    desc: '具备 React Native 跨端经验，ArkTS 认证开发者，掌握鸿蒙应用开发与多端适配方案',
    stats: [
      { value: 150, suffix: '+', label: '鸿蒙适配' },
      { value: 1, suffix: '', label: 'ArkTS 认证' },
      { value: 3, suffix: '+', label: '端覆盖' },
    ],
  },
  {
    id: 'EG',
    icon: '⚡',
    title: '工程化能力',
    desc: '精通 Git Flow 工作流，熟悉 Webpack/Vite 构建工具，具备存量代码治理与组件全生命周期监控 SOP 经验。自学 Java 基础，具备后端协作能力',
    stats: [
      { value: 2, suffix: '+', label: '大厂经验' },
      { value: 100, suffix: '%', label: '规范落地' },
      { value: 0, suffix: '', label: '线上事故' },
    ],
  },
]

function AnimatedNumber({ value, suffix, visible }: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!visible || hasAnimated.current) return
    hasAnimated.current = true
    const duration = 1500
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setCurrent(Math.round(eased * value * 10) / 10)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, value])

  return <span>{Number.isInteger(value) ? current : current.toFixed(1)}{suffix}</span>
}

function SkillCard({ skill, index }: SkillCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -8,
      y: ((e.clientX - r.left) / r.width - 0.5) * 8,
    })
  }, [])

  return (
    <div
      ref={ref}
      className={`skill-card-wrap ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div
        ref={cardRef}
        className="skill-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="skill-card__border" />
        <div className="skill-card__content">
          <div className="skill-card__header">
            <span className="skill-card__icon">{skill.icon}</span>
            <div className="skill-card__arrow">↗</div>
          </div>
          <h3 className="skill-card__title">{skill.title}</h3>
          <p className="skill-card__desc">{skill.desc}</p>
          <div className="skill-card__stats">
            {skill.stats.map((s) => (
              <div key={s.label} className="skill-stat">
                <span className="skill-stat__value">
                  <AnimatedNumber value={s.value} suffix={s.suffix} visible={visible} />
                </span>
                <span className="skill-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Skills() {
  const headingRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="skills" id="skills">
      <div className="skills__inner">
        <div ref={headingRef} className="skills__heading">
          <div className={`section-label ${visible ? 'visible' : ''}`}>Expertise</div>
          <h2 className={`section-title ${visible ? 'visible' : ''}`}>专业技能</h2>
          <p className={`section-desc ${visible ? 'visible' : ''}`}>
            专注于前端开发与跨端能力，从 React/Vue 到鸿蒙生态，持续拓展技术边界
          </p>
        </div>
        <div className="skills__grid">
          {skills.map((s, i) => (
            <SkillCard key={s.id} skill={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
