# Shea Blog

一个基于 React + TypeScript + Vite 构建的个人博客与作品集网站，支持后端 API 动态内容加载、深色/浅色主题切换，并通过 GitHub Actions 自动部署至 GitHub Pages。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM 7
- **UI 组件库**: Ant Design
- **Markdown 渲染**: react-markdown + remark-gfm + rehype-highlight
- **HTTP 客户端**: Axios
- **邮件服务**: EmailJS
- **包管理器**: pnpm

## 功能特性

- 博客文章列表与详情，支持分类筛选
- Obsidian 风格 Markdown 解析（Wiki 链接、Callout 块）
- 代码高亮（highlight.js）
- 作品集展示
- 收藏夹页面
- 留言板（提交、展示、置顶）
- 深色 / 浅色主题切换（localStorage 持久化）
- 自定义鼠标光标动效（桌面端）
- 页面滚动进度指示条
- 响应式设计，支持移动端

## 项目结构

```
src/
├── api/          # Axios 实例与接口封装
├── pages/        # 页面级组件（Blog、BlogPost、Projects、Favorites、Guestbook 等）
├── sections/     # 首页各区块（Hero、Skills、About 等）
├── common/       # 公共组件（Nav、Footer、CustomCursor、PageLoader）
├── utils/        # 工具函数（Markdown 处理）
├── assets/       # 静态资源
└── fonts/        # 本地字体文件
```

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在根目录创建 `.env` 文件：

```env
VITE_API_BASE=http://127.0.0.1:8000/api
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_GITHUB_TOKEN=your_github_token
```

### 3. 启动开发服务器

```bash
pnpm dev
```

### 4. 构建生产版本

```bash
pnpm build
```

## 后端 API

前端默认连接 `http://127.0.0.1:8000/api`，可通过 `VITE_API_BASE` 环境变量覆盖。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/categories` | 获取文章分类 |
| GET | `/posts` | 获取文章列表（支持分类筛选） |
| GET | `/posts/{slug}` | 获取文章详情 |
| GET | `/about` | 获取个人简介 |
| GET | `/projects` | 获取项目列表 |
| GET | `/projects/{slug}` | 获取项目详情 |
| GET | `/guests` | 获取留言列表 |
| POST | `/guests` | 提交留言 |
| PATCH | `/guests/{id}/pin` | 置顶留言（管理员） |

## 部署

项目通过 GitHub Actions 自动部署至 GitHub Pages。推送至 `main` 分支后会触发工作流：

1. 安装 Node.js 20 + pnpm 9
2. `pnpm install --frozen-lockfile`
3. 将 GitHub Secrets 写入 `.env`
4. `pnpm build` 生成 `/dist`
5. 自动发布至 GitHub Pages

需在仓库 Settings → Secrets 中配置以下变量：

- `VITE_GITHUB_TOKEN`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
