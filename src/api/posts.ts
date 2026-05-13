// src/api/posts.ts
import request from './request'
import type { Category, PostMeta, PostDetail, About, Project, PostsApiResponse } from './types'

/** 获取所有公开分类 */
export const fetchCategories = (): Promise<Category[]> => {
  return request.get('/api/categories')
}

/** 获取文章列表（可选按分类过滤） */
export const fetchPosts = (categorySlug?: string): Promise<PostsApiResponse[]> => {
  return request.get('/api/posts', {
    params: categorySlug ? { category: categorySlug } : undefined,
  })
}

/** 获取单篇文章详情 */
export const fetchPostBySlug = (slug: string): Promise<PostDetail> => {
  return request.get(`/api/posts/${encodeURIComponent(slug)}`)
}

/** 获取关于信息 */
export const getAbout = (): Promise<About> => {
  return request.get('/api/about')
}

/** 获取项目信息 */
export const getProjects = (): Promise<Project[]> => {
  return request.get('/api/projects')
}

export const getProjectBySlug = (slug: string): Promise<Project> => {
  return request.get(`/api/projects/${slug}`)
}