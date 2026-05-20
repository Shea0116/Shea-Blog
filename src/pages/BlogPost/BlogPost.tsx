import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import type { ReactNode } from 'react'
import { fetchPostBySlug, fetchPosts, postImageList, postImageByPath } from '@/api/posts'
import { processObsidianMarkdown, estimateReadTime } from '@/utils/markdown'
import type { PostDetail, PostMeta, PostImageResponseItem } from '@/api/types'
import { useAppendix } from '@/context/AppendixContext'
import './BlogPost.css'

// ── 工具函数 ────────────────────────────────────────────────
function inferTags(path: string): string[] {
  const tags: string[] = []
  if (path.includes('Java')) tags.push('Java')
  if (path.includes('React') || path.includes('react')) tags.push('React')
  if (path.includes('TypeScript') || path.includes('typescript')) tags.push('TypeScript')
  if (path.includes('Vue') || path.includes('vue')) tags.push('Vue')
  if (tags.length === 0) tags.push('笔记')
  return tags
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    || `heading-${Math.random().toString(36).slice(2, 6)}`
}

function childrenToText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(childrenToText).join('')
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    const el = children as { props?: { children?: ReactNode } }
    return childrenToText(el.props?.children)
  }
  return ''
}

interface TocItem {
  id: string
  text: string
  level: number
}

function extractToc(markdown: string): TocItem[] {
  const regex = /^(#{2,3})\s+(.+)$/gm
  const items: TocItem[] = []
  let match
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    items.push({ id: slugify(text), text, level })
  }
  return items
}

function getMimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  }
  return map[ext] || 'image/png'
}

// ── 骨架屏 ──────────────────────────────────────────────────
function BlogPostSkeleton() {
  return (
    <div className="blog-post-skeleton">
      <div className="bp-sk bp-sk--tag" />
      <div className="bp-sk bp-sk--title" />
      <div className="bp-sk bp-sk--meta" />
      <div className="bp-sk-divider" />
      {[100, 90, 100, 75, 100, 85, 60, 100, 95, 70].map((w, i) => (
        <div key={i} className="bp-sk bp-sk--line" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

// ── 代码块组件 ────────────────────────────────────────────────
function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false)

  // 从 children 中提取 code element
  const childArr = Array.isArray(children) ? children : [children]
  const codeEl = childArr[0] as { props?: { className?: string; children?: ReactNode } } | null
  const className = codeEl?.props?.className || ''
  const lang = className.replace('language-', '') || ''
  const codeText = String(codeEl?.props?.children || '').replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="code-block">
      <div className="code-block__header">
        {lang && <span className="code-block__lang">{lang}</span>}
        <button className="code-block__copy" onClick={handleCopy}>
          {copied
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制</>
          }
        </button>
      </div>
      <pre className="code-block__pre">{children}</pre>
    </div>
  )
}

// ── Obsidian 图片组件 ─────────────────────────────────────────
function ObsidianImage({
  filename,
  alt,
  imageList,
  onLightboxOpen,
}: {
  filename: string
  alt: string
  imageList: PostImageResponseItem[]
  onLightboxOpen: (src: string) => void
}) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (imageList.length === 0) return
    setImgSrc(null)
    setLoadError(false)

    const decodedFilename = (() => { try { return decodeURIComponent(filename) } catch { return filename } })()
    const item = imageList.find(img => img.name === decodedFilename || img.name === filename)
    if (!item) {
      console.warn('[ObsidianImage] 未在 imageList 中找到图片:', decodedFilename, '可用列表:', imageList.map(i => i.name))
      setLoadError(true)
      return
    }

    console.log('[ObsidianImage] 请求图片 path:', item.path)
    postImageByPath(item.path)
      .then(res => {
        // 后端实际返回 { code, data: { path, data }, message }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyRes = res as unknown as any
        const base64: string = anyRes?.data?.data ?? anyRes?.body?.data ?? ''
        if (!base64) {
          console.error('[ObsidianImage] 响应中无 base64 数据, 原始响应:', res)
          setLoadError(true)
          return
        }
        if (base64.startsWith('data:')) {
          setImgSrc(base64)
        } else {
          const mime = item.type || getMimeFromFilename(filename)
          setImgSrc(`data:${mime};base64,${base64}`)
        }
      })
      .catch(err => {
        console.error('[ObsidianImage] 请求失败:', err, '| path:', item.path)
        setLoadError(true)
      })
  }, [filename, imageList, retryCount])

  if (loadError) {
    return (
      <span className="blog-post-img-error">
        <span className="blog-post-img-error__text">[图片加载失败: {filename}]</span>
        <button
          className="blog-post-img-error__retry"
          onClick={() => setRetryCount(c => c + 1)}
          title="重新加载"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          重试
        </button>
      </span>
    )
  }
  if (!imgSrc) {
    return <span className="blog-post-img-skeleton" />
  }
  return (
    <img
      src={imgSrc}
      alt={alt || filename}
      className="blog-post-img"
      onClick={() => onLightboxOpen(imgSrc)}
    />
  )
}

// ── 图片 Lightbox ─────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className="lightbox__img-wrap" onClick={e => e.stopPropagation()}>
        <img src={src} alt="预览" className="lightbox__img" />
      </div>
    </div>
  )
}

// ── TOC 组件 ──────────────────────────────────────────────────
function ArticleToc({
  items,
  activeId,
  show,
  onClose,
}: {
  items: TocItem[]
  activeId: string
  show: boolean
  onClose: () => void
}) {
  if (!show || items.length === 0) return null

  const handleItemClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 90
      window.scrollTo({ top, behavior: 'smooth' })
    }
    onClose()
  }

  return (
    <>
      <div className="article-toc-overlay" onClick={onClose} />
      <nav className="article-toc">
        <div className="article-toc__header">
          <span>目录</span>
          <button className="article-toc__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <ul className="article-toc__list">
          {items.map(item => (
            <li
              key={item.id}
              className={`article-toc__item article-toc__item--h${item.level} ${activeId === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              {item.text}
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

// ── 主页面组件 ────────────────────────────────────────────────
interface PostInfo {
  slug: string
  title: string
  path: string
  date?: string
  tags: string[]
  readTime: string
  category_slug: string
}

export default function BlogPost() {
  const { slug } = useParams()
  const decodedSlug = decodeURIComponent(slug || '')

  const [visible, setVisible] = useState(false)
  const [post, setPost] = useState<PostInfo | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 从 Context 获取附录数据（全局共享，只加载一次）
  const { appendixList } = useAppendix()

  // 图片列表 + 所有文章（用于 wikilink 解析）
  const [imageList, setImageList] = useState<PostImageResponseItem[]>([])
  const [allPosts, setAllPosts] = useState<PostMeta[]>([])
  // 上一篇 / 下一篇
  const [prevPost, setPrevPost] = useState<PostMeta | null>(null)
  const [nextPost, setNextPost] = useState<PostMeta | null>(null)
  // 文章目录
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [showToc, setShowToc] = useState(false)
  const [activeHeadingId, setActiveHeadingId] = useState('')
  // 阅读进度
  const [readProgress, setReadProgress] = useState(0)
  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  // 回到顶部
  const [showBackToTop, setShowBackToTop] = useState(false)

  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => { setVisible(true) }, [])

  // 加载文章 + 图片列表 + 邻近文章（并行）
  useEffect(() => {
    if (!decodedSlug) return

    setLoading(true)
    setPost(null)
    setContent('')
    setImageList([])
    setPrevPost(null)
    setNextPost(null)
    setTocItems([])
    setActiveHeadingId('')

    const postPromise = fetchPostBySlug(decodedSlug)
    const allPostsPromise = fetchPosts().catch(() => [])

    postPromise
      .then(async (data: PostDetail) => {
        if (!data) { setError('not_found'); return }

        const dir = data.path.split('/').slice(0, -1).join('/')
        const processed = processObsidianMarkdown(data.content, dir)

        const catSlug = data.category_slug?.toLowerCase() || ''
        // 从单篇文章返回的 class 字段获取分类（只能是 backend | frontend）
        const imageCategory = ((data as unknown as { class?: string }).class || '').toLowerCase() as 'frontend' | 'backend' | ''

        setPost({
          slug: decodedSlug,
          title: data.title,
          path: data.path,
          date: (data as unknown as { date?: string }).date,
          tags: inferTags(data.path),
          readTime: estimateReadTime(data.content),
          category_slug: catSlug,
        })
        setContent(processed)
        setTocItems(extractToc(processed))

        // 获取图片列表（使用文章返回的 class 字段作为分类）
        postImageList({ category: imageCategory, include_content: false })
          .then(res => {
            // 接口返回格式: { code: number, data: any, message: string }
            const list = (res as unknown as { code: number, data: PostImageResponseItem[] }).data || []
            setImageList(list)
          })
          .catch(() => {})
      })
      .catch(() => setError('load_error'))
      .finally(() => setLoading(false))

    // 上下篇 + 保存全部文章列表（用于 wikilink）
    allPostsPromise.then(sections => {
      const flat = sections.flatMap((s: { posts: PostMeta[] }) => s.posts)
      setAllPosts(flat)
      const idx = flat.findIndex((p: PostMeta) => p.slug === decodedSlug)
      if (idx > 0) setPrevPost(flat[idx - 1])
      if (idx >= 0 && idx < flat.length - 1) setNextPost(flat[idx + 1])
    })
  }, [decodedSlug])

  // 阅读进度 + TOC 当前标题 + 回到顶部
  useEffect(() => {
    const handler = () => {
      // 回到顶部
      setShowBackToTop(window.scrollY > 400)

      // 阅读进度
      if (articleRef.current) {
        const rect = articleRef.current.getBoundingClientRect()
        const scrolled = -rect.top + window.innerHeight * 0.1
        const total = articleRef.current.offsetHeight
        setReadProgress(Math.min(1, Math.max(0, scrolled / total)))
      }

      // 当前标题高亮
      const els = document.querySelectorAll<HTMLElement>('.blog-post-content h2, .blog-post-content h3')
      let active = ''
      els.forEach(el => {
        if (el.getBoundingClientRect().top <= 110) active = el.id
      })
      setActiveHeadingId(active)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLightboxOpen = useCallback((src: string) => setLightboxSrc(src), [])
  const handleLightboxClose = useCallback(() => setLightboxSrc(null), [])

  // ── 自定义 Markdown 渲染器（useMemo 保持引用稳定，imageList 变化时更新）──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mdComponents = useMemo<Record<string, React.ComponentType<any>>>(() => ({
    pre: ({ children }: { children?: ReactNode }) => <CodeBlock>{children}</CodeBlock>,
    h2: ({ children }: { children?: ReactNode }) => {
      const id = slugify(childrenToText(children))
      return <h2 id={id}>{children}</h2>
    },
    h3: ({ children }: { children?: ReactNode }) => {
      const id = slugify(childrenToText(children))
      return <h3 id={id}>{children}</h3>
    },
    img: ({ src, alt }: { src?: string; alt?: string }) => {
      const safeAlt = String(alt || '')
      const safeSrc = String(src || '')

      if (safeSrc.startsWith('/__obsidian__/')) {
        const filename = safeSrc.replace('/__obsidian__/', '')
        return (
          <ObsidianImage
            filename={filename}
            alt={safeAlt}
            imageList={imageList}
            onLightboxOpen={handleLightboxOpen}
          />
        )
      }
      return (
        <img
          src={safeSrc}
          alt={safeAlt}
          className="blog-post-img"
          loading="lazy"
          onClick={() => handleLightboxOpen(safeSrc)}
        />
      )
    },
    a: ({ href, children }: { href?: string; children?: ReactNode }) => {
      const safeHref = String(href || '')
      if (safeHref.startsWith('/__wikilink__/')) {
        const encodedTitle = safeHref.replace('/__wikilink__/', '')
        let title = ''
        try { title = decodeURIComponent(encodedTitle) } catch { title = encodedTitle }

        // 优先从附录列表中查找匹配的文章
        let targetSlug: string | null = null
        for (const category of appendixList) {
          const doc = category.documents.find(d => d.title === title)
          if (doc) {
            targetSlug = doc.slug
            break
          }
        }

        // 如果附录中未找到，从普通文章列表中查找
        if (!targetSlug) {
          const targetPost = allPosts.find(p => p.title === title)
          if (targetPost) {
            targetSlug = targetPost.slug
          }
        }

        if (targetSlug) {
          return <Link to={`/blog/${encodeURIComponent(targetSlug)}`} className="wikilink">{children}</Link>
        }
        return <span className="wikilink wikilink--broken" title={`未找到文章: ${title}`}>{children}</span>
      }
      return <a href={safeHref} target="_blank" rel="noopener noreferrer">{children}</a>
    },
  }), [imageList, handleLightboxOpen, allPosts, appendixList])

  // ── 渲染 ──
  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-page__inner">
          <BlogPostSkeleton />
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
      {/* 文章阅读进度条 */}
      <div
        className="blog-post-read-progress"
        style={{ transform: `scaleX(${readProgress})` }}
      />

      {/* TOC 触发按钮 */}
      {tocItems.length > 0 && (
        <button
          className="article-toc-toggle"
          onClick={() => setShowToc(v => !v)}
          title="目录"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* TOC 面板 */}
      <ArticleToc
        items={tocItems}
        activeId={activeHeadingId}
        show={showToc}
        onClose={() => setShowToc(false)}
      />

      {/* Lightbox */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={handleLightboxClose} />}

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
            <span>Obsidian</span>
            {tocItems.length > 0 && (
              <>
                <span>·</span>
                <span>{tocItems.length} 个章节</span>
              </>
            )}
          </div>
        </header>

        <article className="blog-post-content" ref={articleRef}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            components={mdComponents as any}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* 上一篇 / 下一篇 */}
        {(prevPost || nextPost) && (
          <nav className="blog-post-nav">
            <div className="blog-post-nav__inner">
              {prevPost ? (
                <Link to={`/blog/${encodeURIComponent(prevPost.slug)}`} className="blog-post-nav__item blog-post-nav__item--prev">
                  <span className="blog-post-nav__label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    上一篇
                  </span>
                  <span className="blog-post-nav__title">{prevPost.title}</span>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={`/blog/${encodeURIComponent(nextPost.slug)}`} className="blog-post-nav__item blog-post-nav__item--next">
                  <span className="blog-post-nav__label">
                    下一篇
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                  <span className="blog-post-nav__title">{nextPost.title}</span>
                </Link>
              ) : <div />}
            </div>
          </nav>
        )}
      </div>

      {/* 回到顶部 */}
      {showBackToTop && (
        <button
          className="blog-post-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="回到顶部"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}
    </div>
  )
}
