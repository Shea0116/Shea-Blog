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