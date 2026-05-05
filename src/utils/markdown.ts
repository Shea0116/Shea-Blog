// Obsidian Markdown 内容处理工具
// 将 Obsidian 特有语法转换为标准 Markdown / HTML

/**
 * 处理 Obsidian Markdown 内容，转换为标准格式
 * @param content - 原始 Obsidian Markdown 内容
 * @param basePath - 文件所在目录路径（用于解析相对图片路径）
 * @returns 处理后的 Markdown 内容
 */
export function processObsidianMarkdown(content: string, basePath: string = ''): string {
  let processed = content

  // 1. 转换 Obsidian wiki-link 图片语法: ![[image.png|width]] → 标准格式
  //    由于图片在 GitHub 仓库中，转换为 GitHub raw URL
  processed = processed.replace(
    /!\[\[([^\]|]+?)(?:\|(\d+))?\]\]/g,
    (_match: string, filename: string, width: string) => {
      const rawUrl = `https://raw.githubusercontent.com/Shea0116/Shea-Note/main/${basePath ? basePath + '/' : ''}${filename}`
      if (width) {
        return `![${filename}](${rawUrl}){width=${width}}`
      }
      return `![${filename}](${rawUrl})`
    }
  )

  // 2. 转换 Obsidian wiki-link 双向链接: [[文件名]] → 文件名
  processed = processed.replace(
    /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g,
    (_match: string, filename: string, alias: string) => {
      return alias || filename
    }
  )

  // 3. 处理 Obsidian 表格合并语法 ^^（暂不处理，保持原样）
  //    标准 Markdown 不支持行合并，这里只是移除 ^^ 标记
  processed = processed.replace(/\^\^/g, '')

  // 4. 处理代码块 title 属性: ```java title="实例" → ```java
  processed = processed.replace(
    /```(\w+)\s+title="[^"]*"/g,
    '```$1'
  )

  // 5. 处理 Obsidian callout 语法: > [!note] → 引用块
  processed = processed.replace(
    /^>\s*\[!(\w+)\]\s*(.*)$/gm,
    (_match: string, type: string, content: string) => {
      const typeMap: Record<string, string> = {
        note: '📝 笔记',
        tip: '💡 提示',
        important: '⚠️ 重要',
        warning: '🚨 警告',
        caution: '⛔ 注意',
        info: 'ℹ️ 信息',
      }
      const label = typeMap[type.toLowerCase()] || `📌 ${type}`
      return `> **${label}** ${content}`
    }
  )

  return processed
}

/**
 * 从 Markdown 内容中提取第一段作为摘要
 * @param content - Markdown 内容
 * @param maxLength - 最大长度，默认 120
 */
export function extractExcerpt(content: string, maxLength: number = 120): string {
  // 移除代码块
  let text = content.replace(/```[\s\S]*?```/g, '')
  // 移除图片
  text = text.replace(/!\[.*?\]\(.*?\)/g, '')
  // 移除链接
  text = text.replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
  // 移除标题标记
  text = text.replace(/^#{1,6}\s+/gm, '')
  // 移除加粗/斜体
  text = text.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
  // 移除水平线
  text = text.replace(/^---+$/gm, '')
  // 压缩空白
  text = text.replace(/\n{2,}/g, '\n').trim()

  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...'
  }
  return text
}

/**
 * 估算阅读时间
 * @param content - Markdown 内容
 * @returns 如 "5 min"
 */
export function estimateReadTime(content: string): string {
  // 移除代码块（代码阅读速度不同）
  const textOnly = content.replace(/```[\s\S]*?```/g, '')
  // 中文字符数 + 英文单词数
  const chineseChars = (textOnly.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = (textOnly.match(/[a-zA-Z]+/g) || []).length
  // 中文阅读速度 ~400字/分钟，英文 ~200词/分钟
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200)
  return `${Math.max(1, minutes)} min`
}
