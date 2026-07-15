import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
// import { fetchAllPosts } from '@/utils/github'
import { fetchPosts } from '@/api/posts'
import type { PostMeta, PostsApiResponse } from '@/api/types'
import './Blog.css'

// ── 骨架卡片 ──────────────────────────────────────────────────
function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="blog-card-skeleton" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="sk-cover" />
      <div className="sk-body">
        <div className="sk-line sk-line--meta" />
        <div className="sk-line sk-line--title" />
        <div className="sk-line sk-line--title sk-line--title-short" />
        <div className="sk-line sk-line--excerpt" />
        <div className="sk-line sk-line--excerpt sk-line--excerpt-short" />
      </div>
    </div>
  )
}

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
function inferTags(path: string): string[] {
  const tags: string[] = []
  if (path.includes('Java')) tags.push('Java')
  if (path.includes('React') || path.includes('react')) tags.push('React')
  if (path.includes('TypeScript') || path.includes('typescript')) tags.push('TypeScript')
  if (path.includes('Vue') || path.includes('vue')) tags.push('Vue')
  if (path.includes('CSS') || path.includes('css')) tags.push('CSS')
  if (path.includes('Node') || path.includes('node')) tags.push('Node.js')
  if (tags.length === 0) tags.push('笔记')
  return tags
}

interface EnrichedPost extends PostMeta {
  readTime?: string
  excerpt?: string
  date?: string
}

interface CategorySection {
  category: string
  categoryName: string
  parentCategory: string
  parentCategoryName: string
  posts: EnrichedPost[]
}

interface ParentCategorySection {
  category: string
  categoryName: string
  sections: CategorySection[]
}

const PREVIEW_POST_COUNT = 4

// class/category 是一级分类，path 的父目录是二级分类。
function getPathCategory(post: PostMeta, fallbackCategory: string) {
  const parentCategory = post.class || fallbackCategory || 'others'
  const parentCategoryName = categoryNameMap[parentCategory.toLowerCase()] || parentCategory
  const normalizedPath = post.path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  const pathParts = normalizedPath.split('/').filter(Boolean)

  if (pathParts.length > 1) {
    const directoryParts = pathParts.slice(0, -1)
    const pathCategoryName = directoryParts[directoryParts.length - 1]
    const categoryName = pathCategoryName.toLowerCase() === parentCategory.toLowerCase()
      ? '综合'
      : pathCategoryName
    return {
      category: `${parentCategory}:path:${directoryParts.join('/')}`,
      categoryName,
      parentCategory,
      parentCategoryName,
    }
  }

  const category = post.category_slug || 'uncategorized'
  const apiCategoryName = post.category_name || category
  const categoryName = apiCategoryName.toLowerCase() === parentCategory.toLowerCase()
    ? '综合'
    : apiCategoryName
  return {
    category: `${parentCategory}:api:${category}`,
    categoryName,
    parentCategory,
    parentCategoryName,
  }
}

interface PostCardProps {
  post: EnrichedPost
  index: number
  onVisibilityChange?: (index: number, isVisible: boolean) => void
  postRef?: (el: HTMLAnchorElement | null) => void
}

function PostCard({ post, index, onVisibilityChange, postRef }: PostCardProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (postRef) {
      postRef(ref.current)
    }
  }, [postRef])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          onVisibilityChange?.(index, true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [index, onVisibilityChange])

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

// 分类名称映射
const categoryNameMap: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  others: 'Others',
}

export default function Blog() {
  const headingRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [categorySections, setCategorySections] = useState<CategorySection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showToc, setShowToc] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const postRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  const handleVisibilityChange = useCallback((index: number, isVisible: boolean) => {
    if (isVisible) {
      setShowBackToTop(true)
    }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchPosts()
      .then((response: PostsApiResponse[]) => {
        const sectionMap = new Map<string, CategorySection>()

        response.forEach((item) => {
          item.posts.forEach((post) => {
            const pathCategory = getPathCategory(post, item.category)
            const enrichedPost: EnrichedPost = {
              ...post,
              excerpt: post.summary || '点击阅读全文...',
            }
            const existingSection = sectionMap.get(pathCategory.category)

            if (existingSection) {
              existingSection.posts.push(enrichedPost)
            } else {
              sectionMap.set(pathCategory.category, {
                ...pathCategory,
                posts: [enrichedPost],
              })
            }
          })
        })

        setCategorySections(Array.from(sectionMap.values()))
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch posts:', err)
        setError('加载文章列表失败，请稍后重试')
      })
      .finally(() => setLoading(false))
  }, [])

  // 搜索过滤
  const filteredSections = searchQuery.trim()
    ? categorySections
        .map(section => ({
          ...section,
          posts: section.posts.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(section => section.posts.length > 0)
    : categorySections

  const hasSearchQuery = searchQuery.trim().length > 0
  const totalFilteredPosts = filteredSections.reduce((n, s) => n + s.posts.length, 0)

  const groupByParent = (sections: CategorySection[]): ParentCategorySection[] => {
    const parents = new Map<string, ParentCategorySection>()
    sections.forEach(section => {
      const existingParent = parents.get(section.parentCategory)
      if (existingParent) existingParent.sections.push(section)
      else {
        parents.set(section.parentCategory, {
          category: section.parentCategory,
          categoryName: section.parentCategoryName,
          sections: [section],
        })
      }
    })
    return Array.from(parents.values())
  }

  const parentCategorySections = groupByParent(categorySections)
  const filteredParentSections = groupByParent(filteredSections)

  const scrollToSection = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
  }

  const scrollToPost = (slug: string, category: string) => {
    setExpandedCategories(previous => new Set(previous).add(category))
    setShowToc(false)
    setSelectedCategory(null)
    setSelectedSubcategory(null)

    window.setTimeout(() => {
      const post = postRefs.current[slug]
      if (!post) return
      const offset = 100
      const top = post.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }, 0)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(previous => {
      const next = new Set(previous)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectedParent = parentCategorySections.find(
    section => section.category === selectedCategory
  )
  const selectedChild = selectedParent?.sections.find(
    section => section.category === selectedSubcategory
  )

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
          <div className="blog-page__skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="blog-page__error">
            <p>{error}</p>
          </div>
        )}

        {/* 搜索框 */}
        {!loading && categorySections.length > 0 && (
          <div className="blog-page__search-wrap">
            <div className="blog-page__search">
              <svg className="blog-page__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="blog-page__search-input"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="blog-page__search-clear" onClick={() => setSearchQuery('')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {hasSearchQuery && (
              <p className="blog-page__search-result">
                找到 <strong>{totalFilteredPosts}</strong> 篇文章
              </p>
            )}
          </div>
        )}

        {!loading && !error && categorySections.length === 0 && (
          <div className="blog-page__empty">
            <p>暂无文章，敬请期待 ✨</p>
          </div>
        )}

        {!loading && hasSearchQuery && totalFilteredPosts === 0 && (
          <div className="blog-page__empty">
            <p>没有找到包含「{searchQuery}」的文章</p>
          </div>
        )}

        {!loading && categorySections.length > 0 && (
          <>
            <div className="blog-page__toc-toggle" onClick={() => setShowToc(!showToc)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>

            {showToc && (
              <>
                <div className="blog-page__toc-overlay" onClick={() => { setShowToc(false); setSelectedCategory(null); setSelectedSubcategory(null); }} />
                <div className="blog-page__toc-wrapper">
                  <div className={`blog-page__toc ${selectedCategory ? 'blog-page__toc--shrink' : ''}`}>
                    <div className="blog-page__toc-header">
                      <span>目录</span>
                      <button className="blog-page__toc-close" onClick={() => { setShowToc(false); setSelectedCategory(null); setSelectedSubcategory(null); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <ul className="blog-page__toc-list">
                      {parentCategorySections.map((section) => (
                        <li 
                          key={section.category} 
                          onClick={() => scrollToSection(section.category)}
                          className={selectedCategory === section.category ? 'active' : ''}
                        >
                          {section.categoryName}
                          <span className="blog-page__toc-count">
                            {section.sections.reduce((total, child) => total + child.posts.length, 0)}
                          </span>
                          <svg className="blog-page__toc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedCategory && (
                    <div className="blog-page__toc-sub">
                      <div className="blog-page__toc-sub-header">
                        <button
                          className="blog-page__toc-sub-back"
                          onClick={() => selectedSubcategory ? setSelectedSubcategory(null) : setSelectedCategory(null)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span>{selectedChild?.categoryName || selectedParent?.categoryName}</span>
                      </div>
                      <ul className="blog-page__toc-sub-list">
                        {!selectedSubcategory && selectedParent?.sections.map((section, index) => (
                          <li key={section.category} onClick={() => setSelectedSubcategory(section.category)}>
                            <span className="blog-page__toc-sub-index">{index + 1}</span>
                            <span className="blog-page__toc-sub-title">{section.categoryName}</span>
                            <span className="blog-page__toc-count">{section.posts.length}</span>
                            <svg className="blog-page__toc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </li>
                        ))}
                        {selectedChild?.posts.map((post, index) => (
                            <li key={post.slug} onClick={() => scrollToPost(post.slug, selectedChild.category)}>
                              <span className="blog-page__toc-sub-index">{index + 1}</span>
                              <span className="blog-page__toc-sub-title">{post.title}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="blog-page__sections">
              {filteredParentSections.map((parent, parentIndex) => (
                <div key={parent.category} className="blog-page__parent">
                  <div className="blog-page__parent-header">
                    <span className="blog-page__parent-eyebrow">Category</span>
                    <h2 className="blog-page__parent-title">
                      {parent.categoryName}
                      <span>
                        {parent.sections.reduce((total, section) => total + section.posts.length, 0)} 篇
                      </span>
                    </h2>
                  </div>
                  <div className="blog-page__parent-groups">
                    {parent.sections.map((section, sectionIndex) => {
                      const isExpanded = expandedCategories.has(section.category)
                      const displayedPosts = hasSearchQuery || isExpanded
                        ? section.posts
                        : section.posts.slice(0, PREVIEW_POST_COUNT)
                      const hasMore = section.posts.length > PREVIEW_POST_COUNT

                      return (
                        <div
                          key={section.category}
                          className="blog-page__section"
                          ref={(el) => { sectionRefs.current[section.category] = el }}
                        >
                          <div className="blog-page__section-header">
                            <h3 className={`blog-page__section-title ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${sectionIndex * 0.1}s` }}>
                              {section.categoryName}
                              <span className="blog-page__section-count">{section.posts.length}</span>
                            </h3>
                            {!hasSearchQuery && hasMore && (
                              <span className="blog-page__section-preview-count">
                                当前展示 {displayedPosts.length} 篇
                              </span>
                            )}
                          </div>
                          <div className="blog-page__grid">
                            {displayedPosts.map((post: EnrichedPost, i: number) => (
                              <PostCard
                                key={post.slug}
                                post={post}
                                index={i + sectionIndex * 10 + parentIndex * 100}
                                onVisibilityChange={handleVisibilityChange}
                                postRef={(el) => { postRefs.current[post.slug] = el }}
                              />
                            ))}
                          </div>
                          {!hasSearchQuery && hasMore && (
                            <button
                              type="button"
                              className="blog-page__section-toggle"
                              onClick={() => toggleCategory(section.category)}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? '收起文章' : `查看全部 ${section.posts.length} 篇`}
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points={isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                              </svg>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showBackToTop && (
        <button className="blog-page__back-to-top" onClick={scrollToTop}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </section>
  )
}
