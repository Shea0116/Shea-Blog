// GitHub API 服务层
// 用于读取 Obsidian 仓库中的博客文章和管理留言板 Issues

const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'Shea0116'
const NOTES_REPO = 'Shea-Note'
const BLOG_REPO = 'Shea-Blog'

// GitHub PAT，仅用于留言板写入（创建 Issue）
// 通过 Vite 环境变量注入，避免 token 暴露在前端代码中
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

// 读取请求头（不带认证，公开仓库不需要）
function getReadHeaders() {
  return { 'Accept': 'application/vnd.github.v3+json' }
}

// 写入请求头（带认证，用于创建 Issue）
function getWriteHeaders() {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_TOKEN}`
  }
}

// 获取仓库目录结构
async function getRepoContents(owner, repo, path = '') {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`
  const response = await fetch(url, { headers: getReadHeaders() })
  if (!response.ok) {
    console.error(`Failed to fetch ${path}: ${response.status}`)
    return []
  }
  return response.json()
}

// 获取 Markdown 文件内容
export async function fetchNoteContent(owner, repo, path) {
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
export async function fetchAllPosts() {
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
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return { code: 500, data: [], message: error.message }
  }
}

// 根据 slug 获取单篇文章
export async function fetchPostBySlug(slug) {
  try {
    const content = await fetchNoteContent(REPO_OWNER, NOTES_REPO, `Blog/${slug}.md`)
    if (!content) {
      return { code: 404, data: null, message: 'Post not found' }
    }
    return { code: 200, data: { content, slug }, message: 'success' }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return { code: 500, data: null, message: error.message }
  }
}

// 获取留言板消息（从 Issues 获取）
export async function fetchGuestbookMessages() {
  try {
    const url = `${GITHUB_API}/repos/${REPO_OWNER}/${BLOG_REPO}/issues?state=open&labels=guestbook`
    const response = await fetch(url, { headers: getReadHeaders() })
    if (!response.ok) {
      return { code: response.status, data: [], message: 'Failed to fetch messages' }
    }
    const issues = await response.json()
    const messages = issues.map(issue => ({
      id: issue.number,
      name: issue.user.login,
      content: issue.body,
      createdAt: issue.created_at,
      avatar: issue.user.avatar_url
    }))
    return { code: 200, data: messages.reverse(), message: 'success' }
  } catch (error) {
    console.error('Failed to fetch guestbook messages:', error)
    return { code: 500, data: [], message: error.message }
  }
}

// 提交留言（创建 Issue）
export async function submitGuestbookMessage(name, content, token) {
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
    const data = await response.json()
    return { code: 200, data: data, message: 'success' }
  } catch (error) {
    console.error('Failed to submit message:', error)
    return { code: 500, data: null, message: error.message }
  }
}