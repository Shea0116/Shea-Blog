import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Projects.css'
import { getProjects } from '@/api/posts'
import type { Project } from '@/api/types'
interface ProjectCardProps {
  project: Project
  index: number
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)

    return () => obs.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
          <span className="project-card__type">{project.company}</span>
          <span className="project-card__year">{project.year}</span>
        </div>

        <div className="project-card__body">
          <h3 className="project-card__title">{project.name}</h3>
          <div className="project-card__tags">
            {project.techStack.map((t) => (
              <span key={t} className="project-card__tag">{t}</span>
            ))}
          </div>
          <p className={`project-card__desc ${hovered ? 'show' : ''}`}>{project.summary}</p>
          <div className="project-card__footer">
            <span className="project-card__link">
              查看详情
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Projects() {
  const headingRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    getProjects().then((res) => {
      setProjects(res)
    })
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="projects-page">
      <div className="projects-page__inner">
        <div ref={headingRef} className="projects-page__heading">
          <div className={`section-label ${visible ? 'visible' : ''}`}>Selected Work</div>
          <h2 className={`section-title ${visible ? 'visible' : ''}`}>项目经历</h2>
          <p className={`section-desc ${visible ? 'visible' : ''}`}>
            从大厂核心业务到企业级 ToB 系统，每个项目都是一次技术深度的突破
          </p>
        </div>
        <div className="projects-page__grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}


