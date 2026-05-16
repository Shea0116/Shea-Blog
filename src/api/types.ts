// ! 验证错误详情
export interface ValidationErrorDetail {
  loc: (string | number)[]
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export type ApiErrorResponse = {
  detail: ValidationErrorDetail[]
}

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

export interface About {
  name: string
  age: number
  currentYear: number
  experience: number
  base_location: string
  about_me: string
}

export interface Project {
  id?: number
  slug: string
  name: string
  summary: string
  year: string
  gradient: string
  techStack: string[]
  role: string
  achievements: string[]
  company: string
  detail: string
}

export interface PostsApiResponse {
  id: number
  category: 'Frontend' | 'Backend' | 'Others'
  posts: PostMeta[]
}

/** 留言功能 */
// ? 获取指定留言详情信息
export interface GetGuestsByIdData {
  id: number
}

// ? 提交新留言
export interface PostGuestsData {
  id: number
  nickname: string
  content: string
  created_at: string
  is_pinned: boolean
  pin_order?: number
}

// ? 更新留言的置顶状态和排序权重
export interface PatchGuestPinData {
  is_pinned: boolean
  pin_order?: number
}

// ? 返回留言
export type GetGuestsResponse = PostGuestsData 