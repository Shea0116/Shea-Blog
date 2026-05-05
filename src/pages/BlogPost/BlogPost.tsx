import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// import { fetchPostBySlug } from '@/utils/github'
import { fetchPostBySlug } from '@/api/posts'
import { processObsidianMarkdown, estimateReadTime } from '@/utils/markdown'
import type { PostDetail } from '@/api/types'
import './BlogPost.css'

// 根据文件路径推断分类标签
function inferTags(path: string): string[] {
  const tags: string[] = []
  if (path.includes('Java')) tags.push('Java')
  if (path.includes('React') || path.includes('react')) tags.push('React')
  if (path.includes('TypeScript') || path.includes('typescript')) tags.push('TypeScript')
  if (path.includes('Vue') || path.includes('vue')) tags.push('Vue')
  if (tags.length === 0) tags.push('笔记')
  return tags
}

interface PostInfo {
  slug: string
  title: string
  path: string
  date?: string
  tags: string[]
  readTime: string
}

export default function BlogPost() {
  const { slug } = useParams()
  const decodedSlug = decodeURIComponent(slug || '')
  const [visible, setVisible] = useState(false)
  const [post, setPost] = useState<PostInfo | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    async function loadPost() {
      try {
        // 直接通过 slug 获取文章（轻量，不需要先获取全部列表）
        const data: PostDetail = await fetchPostBySlug(decodedSlug)

        if (!data) {
          setError('not_found')
          setLoading(false)
          return
        }

        const dir = data.path.split('/').slice(0, -1).join('/')
        const processed = processObsidianMarkdown(data.content, dir)

        setPost({
          slug: decodedSlug,
          title: data.title,
          path: data.path,
          date: (data as unknown as { date?: string }).date,
          tags: inferTags(data.path),
          readTime: estimateReadTime(data.content),
        })
        setContent(processed)
      } catch (err) {
        console.error('Failed to load post:', err)
        setError('load_error')
      } finally {
        setLoading(false)
      }
    }

    if (decodedSlug) {
      loadPost()
    }
  }, [decodedSlug])

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-page__inner">
          <div className="blog-post-loading">
            <div className="blog-post-loading__spinner" />
            <p>正在加载文章...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'not_found' || !post) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-page__inner">
          <div className="blog-post-not-found">
            <h2>文章未找到</h2>
            <p>你访问的文章不存在或已被删除</p>
            <Link to="/blog" className="blog-post-back">← 返回博客列表</Link>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'load_error') {
    return (
      <div className="blog-post-page">
        <div className="blog-post-page__inner">
          <div className="blog-post-not-found">
            <h2>加载失败</h2>
            <p>无法加载文章内容，请稍后重试</p>
            <Link to="/blog" className="blog-post-back">← 返回博客列表</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className={`blog-post-page__inner ${visible ? 'visible' : ''}`}>
        <Link to="/blog" className="blog-post-back">← 返回博客列表</Link>

        <header className="blog-post-header">
          <div className="blog-post-header__tags">
            {post.tags.map((t: string) => (
              <span key={t} className="blog-post-header__tag">{t}</span>
            ))}
          </div>
          <h1 className="blog-post-header__title">{post.title}</h1>
          <div className="blog-post-header__meta">
            <time>{post.date || '最近更新'}</time>
            <span>·</span>
            <span>{post.readTime}</span>
            <span>·</span>
            <span>来源: Obsidian</span>
          </div>
        </header>

        <article className="blog-post-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
