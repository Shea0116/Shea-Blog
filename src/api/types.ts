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

// * 文章列表项
export interface PostMeta {
  class: 'frontend' | 'backend' | ''
  slug: string
  title: string
  summary: string
  category_slug: string
  category_name: string
  path: string
  size: number
}

/** 附录数据 */
export interface Appendix {
  category_slug: string
  category_name: string
  documents: [{
    slug: string
    title: string
  }]
}



// * 文章详情（带 Markdown 内容）
export interface PostDetail extends PostMeta {
  content: string
}

// * 文章列表响应
export interface PostsApiResponse {
  id: number
  category: 'frontend' | 'backend' | ''
  posts: PostMeta[]
}

// * 文章图片获取
export interface PostImageData {
  // 图片分类
  category: 'frontend' | 'backend' | ''
  // 是否包含 Base64 编码的图片内容，默认不包含（只返回元数据）
  include_content: boolean
}

export interface PostImageResponseItem {
  name: string
  path: string
  type: string
  size: number
}

/** 关于信息 */
export interface About {
  name: string
  age: number
  currentYear: number
  experience: number
  base_location: string
  about_me: string
}

/** 项目信息 */
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