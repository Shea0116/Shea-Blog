import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllPosts } from '../utils/github.js'
import './Blog.css'

// 渐变色列表，用于文章封面
const gradients = [
  'linear-gradient(135deg, #6366f1, #7c3aed)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #4f46e5, #6366f1)',
  'linear-gradient(135deg, #a78bfa, #c4b5fd)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
]

// 根据文件路径推断分类标签
function inferTags(path) {
  const tags = []
  if (path.includes('Java')) tags.push('Java')
  if (path.includes('React') || path.includes('react')) tags.push('React')
  if (path.includes('TypeScript') || path.includes('typescript')) tags.push('TypeScript')
  if (path.includes('Vue') || path.includes('vue')) tags.push('Vue')
  if (path.includes('CSS') || path.includes('css')) tags.push('CSS')
  if (path.includes('Node') || path.includes('node')) tags.push('Node.js')
  if (tags.length === 0) tags.push('笔记')
  return tags
}

function PostCard({ post, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const gradient = gradients[index % gradients.length]
  const tags = inferTags(post.path)

  return (
    <Link
      to={`/blog/${encodeURIComponent(post.slug)}`}
      ref={ref}
      className={`blog-card ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="blog-card__cover" style={{ background: gradient }}>
        <div className="blog-card__cover-overlay" />
        <span className="blog-card__read-time">{post.readTime || '5 min'}</span>
      </div>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <time className="blog-card__date">{post.date || '最近更新'}</time>
          <div className="blog-card__tags">
            {tags.map((t) => (
              <span key={t} className="blog-card__tag">{t}</span>
            ))}
          </div>
        </div>
        <h3 className="blog-card__title">{post.title}</h3>
        <p className="blog-card__excerpt">{post.excerpt || '点击阅读全文...'}</p>
        <span className="blog-card__link">
          阅读全文
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </div>
    </Link>
  )
}

export default function Blog() {
  const headingRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    fetchAllPosts()
      .then(async (data) => {
        // 为每篇文章获取内容以提取摘要和阅读时间
        const { fetchNoteContent } = await import('../utils/github.js')
        const { extractExcerpt, estimateReadTime, processObsidianMarkdown } = await import('../utils/markdown.js')

        const enriched = await Promise.all(
          data.map(async (post) => {
            try {
              const rawContent = await fetchNoteContent(post.path)
              const processed = processObsidianMarkdown(rawContent, post.path.split('/').slice(0, -1).join('/'))
              return {
                ...post,
                excerpt: extractExcerpt(processed),
                readTime: estimateReadTime(rawContent),
              }
            } catch {
              return {
                ...post,
                excerpt: '点击阅读全文...',
                readTime: '5 min',
              }
            }
          })
        )
        setPosts(enriched)
      })
      .catch((err) => {
        console.error('Failed to fetch posts:', err)
        setError('加载文章列表失败，请稍后重试')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="blog-page">
      <div className="blog-page__inner">
        <div ref={headingRef} className="blog-page__heading">
          <div className={`section-label ${visible ? 'visible' : ''}`}>Blog</div>
          <h2 className={`section-title ${visible ? 'visible' : ''}`}>技术博客</h2>
          <p className={`section-desc ${visible ? 'visible' : ''}`}>
            记录前端开发中的思考、实践与成长，文章同步自 Obsidian 笔记
          </p>
        </div>

        {loading && (
          <div className="blog-page__loading">
            <div className="blog-page__spinner" />
            <p>正在从 GitHub 加载文章...</p>
          </div>
        )}

        {error && (
          <div className="blog-page__error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="blog-page__empty">
            <p>暂无文章，敬请期待 ✨</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="blog-page__grid">
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
