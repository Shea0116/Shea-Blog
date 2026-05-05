import { useEffect, useRef, useState } from 'react'
import './Favorites.css'

interface FavoriteItem {
  name: string
  desc: string
  link?: string
}

interface Category {
  title: string
  icon: string
  items: FavoriteItem[]
}

interface CategorySectionProps {
  category: Category
  index: number
}

const categories: Category[] = [
  {
    title: '开发工具',
    icon: '⚡',
    items: [
      { name: 'VS Code', desc: '主力编辑器，搭配丰富的插件生态', link: 'https://code.visualstudio.com' },
      { name: 'Cursor', desc: 'AI 驱动的代码编辑器，提升编码效率', link: 'https://cursor.sh' },
      { name: 'iTerm2 + Oh My Zsh', desc: '终端环境，高效命令行体验', link: 'https://iterm2.com' },
      { name: 'Figma', desc: 'UI 设计与原型工具', link: 'https://figma.com' },
      { name: 'Obsidian', desc: 'Markdown 笔记与知识管理', link: 'https://obsidian.md' },
    ],
  },
  {
    title: '前端框架 & 库',
    icon: '🧩',
    items: [
      { name: 'React', desc: '主力框架，用于构建用户界面', link: 'https://react.dev' },
      { name: 'Vue 3', desc: '渐进式框架， Composition API 非常优雅', link: 'https://vuejs.org' },
      { name: 'TypeScript', desc: '类型安全，提升代码质量与开发体验', link: 'https://typescriptlang.org' },
      { name: 'Ant Design', desc: '企业级 UI 组件库', link: 'https://ant.design' },
      { name: 'Tailwind CSS', desc: '原子化 CSS 框架，快速构建样式', link: 'https://tailwindcss.com' },
    ],
  },
  {
    title: '学习资源',
    icon: '📚',
    items: [
      { name: 'MDN Web Docs', desc: '最权威的 Web 技术文档', link: 'https://developer.mozilla.org' },
      { name: 'React 官方文档', desc: '新版文档非常优秀', link: 'https://react.dev/learn' },
      { name: 'TypeScript Handbook', desc: 'TS 官方手册，系统学习类型系统', link: 'https://typescriptlang.org/docs/handbook' },
      { name: 'JavaScript.info', desc: '现代 JavaScript 教程', link: 'https://javascript.info' },
    ],
  },
  {
    title: '推荐书籍',
    icon: '📖',
    items: [
      { name: 'JavaScript 高级程序设计', desc: '前端必读经典，深入理解 JS 核心机制' },
      { name: '你不知道的 JavaScript', desc: '深入 JS 作用域、闭包、this 等核心概念' },
      { name: 'CSS 揭秘', desc: '47 个 CSS 实用技巧，提升样式能力' },
      { name: '重构：改善既有代码的设计', desc: '代码质量提升的必读之作' },
    ],
  },
]

function CategorySection({ category, index }: CategorySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`fav-category ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <h3 className="fav-category__title">
        <span className="fav-category__icon">{category.icon}</span>
        {category.title}
      </h3>
      <div className="fav-category__grid">
        {category.items.map((item) => (
          <div key={item.name} className="fav-item">
            <div className="fav-item__info">
              <h4 className="fav-item__name">{item.name}</h4>
              <p className="fav-item__desc">{item.desc}</p>
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="fav-item__link"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 4L4 10M4 4l6 6M4 4h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Favorites() {
  const headingRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="favorites-page">
      <div className="favorites-page__inner">
        <div ref={headingRef} className="favorites-page__heading">
          <div className={`section-label ${visible ? 'visible' : ''}`}>Favorites</div>
          <h2 className={`section-title ${visible ? 'visible' : ''}`}>收藏 & 推荐</h2>
          <p className={`section-desc ${visible ? 'visible' : ''}`}>
            我在日常开发和学习中常用的工具、框架与资源
          </p>
        </div>
        <div className="favorites-page__list">
          {categories.map((cat, i) => (
            <CategorySection key={cat.title} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
