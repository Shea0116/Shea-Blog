import { useEffect, useRef, useState, useCallback } from 'react'
import './Projects.css'

const projects = [
  {
    title: '观澜 · 舆情智慧平台',
    tags: ['React', 'TypeScript', 'ECharts', 'Node.js'],
    desc: '全网舆情监测与分析平台，支持多维度数据检索、情感分析与可视化大屏展示，为政府及企业提供实时舆情决策支持',
    year: '2026',
    gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
    highlight: '滴滴',
  },
  {
    title: '营销平台鸿蒙适配与工程化建设',
    tags: ['ArkTS', 'HarmonyOS', 'React', 'MSI Bridge'],
    desc: '主导美团营销平台 150+ 组件的鸿蒙原生适配，完成 JSBridge 协议从 KNB 到 MSI 的全面迁移，建立多端编译管理与组件线上监控 SOP',
    year: '2025',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    highlight: '美团',
  },
  {
    title: '医疗商品 SKU 招商支撑系统',
    tags: ['React', 'Next.js', 'React Hook Form', 'Mock.js'],
    desc: '美团医疗团购核心招商系统，开发多 SKU 动态定价模块，通过 Hook Form + useMemo 解决海量表单性能瓶颈，封装价格校验函数集规避 920 大促资损风险',
    year: '2025',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    highlight: '美团',
  },
  {
    title: 'CI/CD 持续集成部署平台',
    tags: ['Vue3', 'Element Plus', 'WebSocket', 'GoEasy'],
    desc: '面向企业开发者的 CI/CD 平台，实现从代码提交到软件发布的全流程自动化。通过 WebSocket 实现多人协作下分支状态的实时同步',
    year: '2024',
    gradient: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
    highlight: 'ToB',
  },
  {
    title: 'M 端出差管理系统',
    tags: ['React', 'Redux', 'Ant Design Mobile', 'ECharts'],
    desc: '企业级出差全流程申请系统，涵盖 6 大服务模块。集成高德地图 API 实现精准定位（误差 < 5m），通过骨架屏 + Canvas 分片渲染优化移动端性能',
    year: '2023',
    gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)',
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

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -6,
      y: ((e.clientX - r.left) / r.width - 0.5) * 6,
    })
  }, [])

  return (
    <div
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
    </div>
  )
}

export default function Projects() {
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
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
