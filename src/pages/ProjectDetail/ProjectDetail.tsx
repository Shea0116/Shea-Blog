import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projects, type Project } from '@/pages/Projects/Projects'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { slug } = useParams()
  const [visible, setVisible] = useState(false)

  const project: Project | undefined = projects.find((p: Project) => p.slug === slug)

  useEffect(() => {
    setVisible(true)
  }, [])

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-page__inner">
          <div className="project-detail-not-found">
            <h2>项目未找到</h2>
            <p>你访问的项目不存在</p>
            <Link to="/projects" className="project-detail-back">← 返回项目列表</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="project-detail-page">
      <div className={`project-detail-page__inner ${visible ? 'visible' : ''}`}>
        <Link to="/projects" className="project-detail-back">← 返回项目列表</Link>

        <header className="project-detail-header">
          <div className="project-detail-header__cover" style={{ background: project.gradient }}>
            <div className="project-detail-header__cover-overlay" />
            <div className="project-detail-header__cover-content">
              <span className="project-detail-header__type">{project.highlight}</span>
              <span className="project-detail-header__year">{project.year}</span>
            </div>
          </div>
          <div className="project-detail-header__info">
            <h1 className="project-detail-header__title">{project.title}</h1>
            <p className="project-detail-header__role">{project.role}</p>
            <div className="project-detail-header__tags">
              {project.tags.map((t: string) => (
                <span key={t} className="project-detail-header__tag">{t}</span>
              ))}
            </div>
          </div>
        </header>

        <div className="project-detail-body">
          <section className="project-detail-section">
            <h2 className="project-detail-section__title">项目简介</h2>
            <p className="project-detail-section__text">{project.desc}</p>
          </section>

          {project.achievements && (
            <section className="project-detail-section">
              <h2 className="project-detail-section__title">核心成果</h2>
              <ul className="project-detail-achievements">
                {project.achievements.map((a: string, i: number) => (
                  <li key={i} className="project-detail-achievements__item">
                    <span className="project-detail-achievements__icon">✦</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="project-detail-section">
            <h2 className="project-detail-section__title">技术栈</h2>
            <div className="project-detail-tech-stack">
              {project.tags.map((t: string) => (
                <div key={t} className="project-detail-tech-item">
                  <span className="project-detail-tech-item__name">{t}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
