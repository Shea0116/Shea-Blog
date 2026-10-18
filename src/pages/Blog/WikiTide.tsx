import { BLOG_URL } from '@/config/links'
import './Blog.css'

// 保留旧 /blog 地址的可访问入口；新标签页由用户点击链接打开。
export default function WikiTide() {
  return (
    <section className="blog-page">
      <div className="blog-page__inner">
        <div className="blog-page__heading">
          <div className="section-label visible">Blog</div>
          <h1 className="section-title visible">技术博客</h1>
          <p className="section-desc visible">博客与学习笔记已迁移至 WikiTide，点击下方链接在新标签页中阅读。</p>
        </div>
        <a className="blog-page__external" href={BLOG_URL} target="_blank" rel="noopener noreferrer">
          访问 WikiTide 博客 ↗
          <span>新标签页打开</span>
        </a>
      </div>
    </section>
  )
}
