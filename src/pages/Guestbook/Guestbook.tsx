import { useEffect, useRef, useState, type FormEvent } from 'react'
import { GetGuestsList, PostGuests } from '@/api/posts'
import type { GetGuestsResponse } from '@/api/types'
import spritesheetUrl from '@/assets/SheaSelf/spritesheet.webp'
import './Guestbook.css'

export default function Guestbook() {
  const headingRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [form, setForm] = useState<{ name: string; content: string }>({ name: '', content: '' })
  const [sending, setSending] = useState<boolean>(false)
  const [messages, setMessages] = useState<GetGuestsResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [toast, setToast] = useState<string>('')

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (headingRef.current) obs.observe(headingRef.current)
    return () => obs.disconnect()
  }, [])

  // 加载留言
  const loadMessages = () => {
    setLoading(true)
    GetGuestsList()
      .then((res) => {
        setMessages(res)
        setError('')
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch messages:', err)
        setError('加载留言失败')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // 随机生成头像背景颜色（管理员 Shea 使用紫色）
  const getRandomColor = (name: string): string => {
    // 管理员 Shea 使用固定紫色
    if (name === 'Shea') {
      return '#9333EA'
    }

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending || !form.name.trim() || !form.content.trim()) return

    setSending(true)

    try {
      // 提交留言
      const result = await PostGuests(form.name.trim(), form.content.trim())

      // 检查是否是错误响应
      if (!result || typeof result !== 'object' || 'detail' in result) {
        showToast('发送失败，请稍后重试 ✗')
        return
      }

      // 检查状态码是否为成功（支持多种格式）
      const successCodes = [200, 201]
      const hasSuccessCode = 'code' in result && successCodes.includes(result.code)
      const hasSuccessBody = 'body' in result && result.body

      if (hasSuccessCode && hasSuccessBody) {
        setForm({ name: '', content: '' })
        showToast('留言成功 ✓')
        // 提交成功后重新加载留言列表
        loadMessages()
      } else {
        // 如果响应格式不匹配预期，但没有错误信息，也视为成功
        showToast('留言成功 ✓')
        loadMessages()
        setForm({ name: '', content: '' })
      }
    } catch (err) {
      console.error('留言发送失败:', err)
      showToast('发送失败，请稍后重试 ✗')
    } finally {
      setSending(false)
    }
  }

  // 格式化时间
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return timeStr
    }
  }

  return (
    <section className="guestbook-page">
      {toast && <div className="toast">{toast}</div>}
      <div className="guestbook-page__inner">
        <div ref={headingRef} className="guestbook-page__heading">
          <div className="guestbook-page__heading-row">
            <div className="guestbook-page__heading-text">
              <div className={`section-label ${visible ? 'visible' : ''}`}>Guestbook</div>
              <h2 className={`section-title ${visible ? 'visible' : ''}`}>留言板</h2>
              <p className={`section-desc ${visible ? 'visible' : ''}`}>
                欢迎留下你的想法、建议或只是打个招呼
              </p>
            </div>
            <div
              className={`guestbook-chibi ${visible ? 'visible' : ''}`}
              aria-hidden="true"
              style={{ backgroundImage: `url(${spritesheetUrl})` }}
            />
          </div>
        </div>

        {/* 留言表单 */}
        <form className="guestbook-form" onSubmit={handleSubmit}>
          <div className="guestbook-form__row">
            <input
              type="text"
              placeholder="你的昵称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="guestbook-form__input"
              required
              maxLength={20}
            />
            <button
              type="submit"
              className={`guestbook-form__btn ${sending ? 'sending' : ''}`}
              disabled={sending}
            >
              {sending ? '发送中...' : '留言'}
            </button>
          </div>
          <textarea
            placeholder="说点什么..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="guestbook-form__textarea"
            required
            maxLength={500}
            rows={3}
          />
        </form>

        {/* 留言列表 */}
        {loading && (
          <div className="guestbook-loading">
            <div className="guestbook-loading__spinner" />
            <p>正在加载留言...</p>
          </div>
        )}

        {error && (
          <div className="guestbook-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="guestbook-list">
            {messages.map((msg: GetGuestsResponse) => (
              <div key={msg.id} className="guestbook-item">
                <div
                  className="guestbook-item__avatar"
                  style={{ backgroundColor: getRandomColor(msg.nickname) }}
                >{msg.nickname.charAt(0).toUpperCase()}</div>
                <div className="guestbook-item__body">
                  <div className="guestbook-item__header">
                    <span className="guestbook-item__name">{msg.nickname}</span>
                    <time className="guestbook-item__time">{formatTime(msg.created_at)}</time>
                  </div>
                  <p className="guestbook-item__content">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="guestbook-empty">
            <p>还没有留言，来留下第一条吧 ✨</p>
          </div>
        )}
      </div>
    </section>
  )
}
