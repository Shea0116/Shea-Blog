// src/api/posts.ts
import request from './request'
import type { Category, PostMeta, PostDetail, About, Project, PostsApiResponse, GetGuestsResponse, PostGuestsData, ApiErrorResponse, PatchGuestPinData, PostImageData, PostImageResponseItem, Appendix } from './types'

/** 获取所有公开分类 */
export const fetchCategories = (): Promise<Category[]> => {
  return request.get('/categories')
}

/** 获取文章列表（可选按分类过滤） */
export const fetchPosts = (categorySlug?: string): Promise<PostsApiResponse[]> => {
  return request.get('/posts', {
    params: categorySlug ? { category: categorySlug } : undefined,
  })
}

/** 获取附录数据 */
export const getAppendixList = (): Promise<Appendix[]> => {
  return request.get('/appendix')
}

/** 获取单篇文章详情 */
export const fetchPostBySlug = (slug: string): Promise<PostDetail> => {
  return request.get(`/posts/${encodeURIComponent(slug)}`)
}

/** 获取文章图片列表 */
export const postImageList = (data: PostImageData): Promise<PostImageResponseItem[]> => {
  return request.post('/images', data)
}

/** 获取单个文章图片（path 以 query 参数传递，非 body） */
export const postImageByPath = (path: string): Promise<{ code: number, body: { path: string, data: string }, message: string }> => {
  return request.post('/images/base64', undefined, { params: { path } })
}

/** 获取关于信息 */
export const getAbout = (): Promise<About> => {
  return request.get('/about')
}

/** 获取项目信息 */
export const getProjects = (): Promise<Project[]> => {
  return request.get('/projects')
}

export const getProjectBySlug = (slug: string): Promise<Project> => {
  return request.get(`/projects/${slug}`)
}

/** 留言功能  */
// ? 获取留言列表
export const GetGuestsList = (): Promise<GetGuestsResponse[]> => {
  return request.get(`/guests`)
}

// ? 提交新留言
export const PostGuests = (nickname: string, content: string): Promise<{ code: number, body: GetGuestsResponse, message: string } | ApiErrorResponse> => {
  return request.post('/guests', {nickname, content})
}

// * 更新留言的置顶状态和排序权重
export const PatchGuestPinById = (id: number, data: PatchGuestPinData): Promise<{ code: number, message: string }> => {
  return request.patch(`/guests/${id}/pin`, data)
}
