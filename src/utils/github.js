// GitHub API 服务层
// 用于读取 Obsidian 仓库中的博客文章和管理留言板 Issues

const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'Shea0116'
const NOTES_REPO = 'Shea-Note'
const BLOG_REPO = 'Shea-Blog'

// GitHub PAT，仅用于留言板写入（创建 Issue）
// 读取操作不需要 token（公开仓库），避免 token 失效导致 401
// ⚠️ 生产环境建议通过环境变量注入
const GITHUB_TOKEN = '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'

// 读取请求头（不带认证，公开仓库不需要）
function getReadHeaders() {
  return { 'Accept': 'application/vnd.github.v3+json' }
}

// ── 博客文章相关 ──

/**
 * 获取 Obsidian 仓库中指定目录下的所有 .md 文件
 */
export async function fetchNoteFiles(path = '') {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${NOTES_REPO}/contents/${path}`,
    { headers: getReadHeaders() }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return data
    .filter((item) => item.type === 'file' && item.name.endsWith('.md') && item.name !== 'test.md')
    .map((item) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      download_url: item.download_url,
    }))
}

/**
 * 获取单个 .md 文件的原始内容
 */
export async function fetchNoteContent(path) {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${NOTES_REPO}/contents/${encodeURIComponent(path)}`,
    { headers: getReadHeaders() }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return decodeURIComponent(escape(atob(data.content)))
}

/**
 * 根据 slug 反推文件路径并直接获取文章内容和基本信息
 */
export async function fetchPostBySlug(slug) {
  const scanDirs = ['Java/Note', 'Note']

  for (const dir of scanDirs) {
    try {
      const files = await fetchNoteFiles(dir)
      const matched = files.find((f) => {
        const fileSlug = f.path.replace(/\.md$/, '').replace(/\//g, '-').replace(/\s+/g, '-')
        return fileSlug === slug
      })
      if (matched) {
        const [content, date] = await Promise.all([
          fetchNoteContent(matched.path),
          fetchLastCommitDate(matched.path),
        ])
        return {
          title: matched.name.replace(/\.md$/, ''),
          path: matched.path,
          content,
          date,
        }
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * 获取文件最后提交日期
 */
async function fetchLastCommitDate(filePath) {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${NOTES_REPO}/commits?path=${encodeURIComponent(filePath)}&per_page=1`,
      { headers: getReadHeaders() }
    )
    if (res.ok) {
      const commits = await res.json()
      if (commits.length > 0) {
        return commits[0].commit.author.date.split('T')[0]
      }
    }
  } catch {
    // ignore
  }
  return ''
}

/**
 * 获取所有博客文章列表（含元数据）
 */
export async function fetchAllPosts() {
  const scanDirs = ['Java/Note', 'Note']

  const allFiles = []
  for (const dir of scanDirs) {
    try {
      const files = await fetchNoteFiles(dir)
      allFiles.push(...files)
    } catch (e) {
      console.warn(`Failed to fetch ${dir}:`, e)
    }
  }

  const posts = await Promise.all(
    allFiles.map(async (file) => {
      const date = await fetchLastCommitDate(file.path)
      const title = file.name.replace(/\.md$/, '')
      const slug = file.path.replace(/\.md$/, '').replace(/\//g, '-').replace(/\s+/g, '-')
      return { slug, title, path: file.path, date, size: file.size }
    })
  )

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return posts
}

// ── 留言板 Issues 相关 ──

const GUESTBOOK_TITLE_PREFIX = '留言:'

/**
 * 获取留言板的所有留言
 */
export async function fetchGuestbookMessages() {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${BLOG_REPO}/issues?state=all&per_page=100&sort=created&direction=desc`,
    { headers: getReadHeaders() }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const issues = await res.json()

  const guestbookIssues = issues.filter((issue) => issue.title.startsWith(GUESTBOOK_TITLE_PREFIX))

  return guestbookIssues.map((issue) => {
    let name = '匿名'
    let content = issue.title.replace(GUESTBOOK_TITLE_PREFIX, '').trim()
    try {
      const parsed = JSON.parse(issue.body)
      name = parsed.name || '匿名'
      content = parsed.content || content
    } catch {
      content = issue.body || content
    }
    return {
      id: issue.number,
      name,
      content,
      time: issue.created_at,
      avatar: name.charAt(0).toUpperCase(),
    }
  })
}

/**
 * 提交新留言（创建 GitHub Issue）
 */
export async function submitGuestbookMessage(name, content, token) {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${BLOG_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `${GUESTBOOK_TITLE_PREFIX} ${name}`,
        body: JSON.stringify({ name, content }),
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API error: ${res.status}`)
  }
  return res.json()
}

/**
 * @deprecated 不再需要
 */
export async function ensureGuestbookLabel() {
  // no-op
}
