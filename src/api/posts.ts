// src/api/posts.ts
import request from './request'
import type { Category, PostMeta, PostDetail } from './types'

/** 获取所有公开分类 */
export const fetchCategories = (): Promise<Category[]> => {
  return request.get('/api/categories')
}

/** 获取文章列表（可选按分类过滤） */
export const fetchPosts = (categorySlug?: string): Promise<PostMeta[]> => {
  return request.get('/api/posts', {
    params: categorySlug ? { category: categorySlug } : undefined,
  })
}

/** 获取单篇文章详情 */
export const fetchPostBySlug = (slug: string): Promise<PostDetail> => {
  return request.get(`/api/posts/${encodeURIComponent(slug)}`)
}