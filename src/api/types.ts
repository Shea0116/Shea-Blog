// src/api/types.ts

/** 文章分类 */
export interface Category {
  slug: string
  name: string
  folder: string
  description: string
  order: number
}

/** 文章列表项 */
export interface PostMeta {
  slug: string
  title: string
  summary: string
  category_slug: string
  category_name: string
  path: string
  size: number
}

/** 文章详情（带 Markdown 内容） */
export interface PostDetail extends PostMeta {
  content: string
}