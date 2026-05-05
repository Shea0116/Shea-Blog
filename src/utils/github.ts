// GitHub API 服务层
// 用于读取 Obsidian 仓库中的博客文章和管理留言板 Issues

const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'Shea0116'
const NOTES_REPO = 'Shea-Note'
const BLOG_REPO = 'Shea-Blog'

// GitHub PAT，仅用于留言板写入（创建 Issue）
// 通过 Vite 环境变量注入，避免 token 暴露在前端代码中
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

// GitHub API 响应类型
interface GitHubContentItem {
  type: string
  name: string
  path: string
  sha: string
  html_url: string
}

interface GitHubIssue {
  number: number
  body: string
  created_at: string
  user: {
    login: string
    avatar_url: string
  }
}

// 留言消息类型
export interface GuestbookMessage {
  id: number
  name: string
  content: string
  createdAt: string
  avatar: string
}

// 通用 API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 读取请求头（不带认证，公开仓库不需要）
function getReadHeaders(): Record<string, string> {
  return { 'Accept': 'application/vnd.github.v3+json' }
}

// 写入请求头（带认证，用于创建 Issue）
export function getWriteHeaders(): Record<string, string> {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_TOKEN}`
  }
}

// 获取仓库目录结构
async function getRepoContents(owner: string, repo: string, path: string = ''): Promise<GitHubContentItem[]> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`
  const response = await fetch(url, { headers: getReadHeaders() })
  if (!response.ok) {
    console.error(`Failed to fetch ${path}: ${response.status}`)
    return []
  }
  return response.json()
}

// 获取 Markdown 文件内容
export async function fetchNoteContent(owner: string, repo: string, path: string): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`
  const response = await fetch(url, { headers: getReadHeaders() })
  if (!response.ok) {
    console.error(`Failed to fetch note: ${response.status}`)
    return null
  }
  const data = await response.json()
  if (data.content) {
    return decodeURIComponent(escape(window.atob(data.content)))
  }
  return null
}

// 获取所有博客文章列表
export async function fetchAllPosts(): Promise<ApiResponse<{ slug: string; title: string; path: string; sha: string; url: string }[]>> {
  try {
    const contents = await getRepoContents(REPO_OWNER, NOTES_REPO, 'Blog')
    const posts = contents
      .filter(item => item.type === 'file' && item.name.endsWith('.md'))
      .map(item => {
        const slug = item.name.replace('.md', '')
        return {
          slug,
          title: slug.replace(/-/g, ' '),
          path: item.path,
          sha: item.sha,
          url: item.html_url
        }
      })
    return { code: 200, data: posts, message: 'success' }
  } catch (error: unknown) {
    console.error('Failed to fetch posts:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { code: 500, data: [], message }
  }
}

// 根据 slug 获取单篇文章
export async function fetchPostBySlug(slug: string): Promise<ApiResponse<{ content: string; slug: string } | null>> {
  try {
    const content = await fetchNoteContent(REPO_OWNER, NOTES_REPO, `Blog/${slug}.md`)
    if (!content) {
      return { code: 404, data: null, message: 'Post not found' }
    }
    return { code: 200, data: { content, slug }, message: 'success' }
  } catch (error: unknown) {
    console.error('Failed to fetch post:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { code: 500, data: null, message }
  }
}

// 获取留言板消息（从 Issues 获取）
export async function fetchGuestbookMessages(): Promise<ApiResponse<GuestbookMessage[]>> {
  try {
    const url = `${GITHUB_API}/repos/${REPO_OWNER}/${BLOG_REPO}/issues?state=open&labels=guestbook`
    const response = await fetch(url, { headers: getReadHeaders() })
    if (!response.ok) {
      return { code: response.status, data: [], message: 'Failed to fetch messages' }
    }
    const issues: GitHubIssue[] = await response.json()
    const messages: GuestbookMessage[] = issues.map(issue => ({
      id: issue.number,
      name: issue.user.login,
      content: issue.body,
      createdAt: issue.created_at,
      avatar: issue.user.avatar_url
    }))
    return { code: 200, data: messages.reverse(), message: 'success' }
  } catch (error: unknown) {
    console.error('Failed to fetch guestbook messages:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { code: 500, data: [], message }
  }
}

// 提交留言（创建 Issue）
export async function submitGuestbookMessage(name: string, content: string, token: string): Promise<ApiResponse<GitHubIssue | null>> {
  try {
    const url = `${GITHUB_API}/repos/${REPO_OWNER}/${BLOG_REPO}/issues`
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`
    }
    const body = {
      title: `Guestbook message from ${name}`,
      body: content,
      labels: ['guestbook']
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const errorData = await response.json()
      return { code: response.status, data: null, message: errorData.message || 'Failed to submit' }
    }
    const data: GitHubIssue = await response.json()
    return { code: 200, data: data, message: 'success' }
  } catch (error: unknown) {
    console.error('Failed to submit message:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { code: 500, data: null, message }
  }
}
