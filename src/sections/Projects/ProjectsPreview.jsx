import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../Projects/Projects.css'

const previewProjects = [
  {
    slug: 'guanlan-opinion-platform',
    title: '观澜 · 舆情智慧平台',
    tags: ['React', 'TypeScript', 'ECharts', 'Node.js'],
    desc: '全网舆情监测与分析平台，支持多维度数据检索、情感分析与可视化大屏展示',
    year: '2026',
    gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
    highlight: '滴滴',
  },
  {
    slug: 'meituan-harmonyos-adaptation',
    title: '营销平台鸿蒙适配与工程化建设',
    tags: ['ArkTS', 'HarmonyOS', 'React', 'MSI Bridge'],
    desc: '主导美团营销平台 150+ 组件的鸿蒙原生适配，完成 JSBridge 协议全面迁移',
    year: '2025',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    highlight: '美团',
  },
  {
    slug: 'meituan-medical-sku',
    title: '医疗商品 SKU 招商支撑系统',
    tags: ['React', 'Next.js', 'React Hook Form', 'Mock.js'],
    desc: '美团医疗团购核心招商系统，开发多 SKU 动态定价模块',
    year: '2025',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    highlight: '美团',
  },
  {
    slug: 'cicd-platform',
    title: 'CI/CD 持续集成部署平台',
    tags: ['Vue3', 'Element Plus', 'WebSocket', 'GoEasy'],
    desc: '面向企业开发者的 CI/CD 平台，实现从代码提交到软件发布的全流程自动化',
    year: '2024',
    gradient: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
    highlight: 'ToB',
  },
]

function ProjectCard({ project, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -6,
      y: ((e.clientX - r.left) / r.width - 0.5) * 6,
    })
  }

  return (
    <Link
      to={`/projects/${project.slug}`}
      ref={ref}
      className={`project-card-wrap ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div
        ref={cardRef}
        className={`project-card ${hovered ? 'hovered' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false) }}
        onMouseEnter={() => setHovered(true)}
        style={{ transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="project-card__preview" style={{ background: project.gradient }}>
          <div className="project-card__preview-overlay" />
          <span className="project-card__type">{project.highlight}</span>
          <span className="project-card__year">{project.year}</span>
        </div>
        <div className="project-card__body">
          <h3 className="project-card__title">{project.title}</h3>
          <div className="project-card__tags">
            {project.tags.map((t) => (
              <span key={t} className="project-card__tag">{t}</span>
            ))}
          </div>
          <p className={`project-card__desc ${hovered ? 'show' : ''}`}>{project.desc}</p>
          <div className="project-card__footer">
            <span className="project-card__link">
              查看详情
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ProjectsPreview() {
  const headingRef = useRef(null)
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
    <section className="projects" id="projects">
      <div className="projects__inner">
        <div ref={headingRef} className="projects__heading">
          <div className={`section-label ${visible ? 'visible' : ''}`}>Selected Work</div>
          <h2 className={`section-title ${visible ? 'visible' : ''}`}>项目经历</h2>
          <p className={`section-desc ${visible ? 'visible' : ''}`}>
            从大厂核心业务到企业级 ToB 系统，每个项目都是一次技术深度的突破
          </p>
        </div>
        <div className="projects__grid">
          {previewProjects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
        <div className="projects__more">
          <Link to="/projects" className="projects__more-btn">
            查看全部项目
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
