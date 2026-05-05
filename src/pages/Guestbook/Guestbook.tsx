import { useEffect, useRef, useState, type FormEvent } from 'react'
import { fetchGuestbookMessages, submitGuestbookMessage, type GuestbookMessage } from '@/utils/github'
import './Guestbook.css'

// GitHub PAT 通过环境变量注入
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

export default function Guestbook() {
  const headingRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [form, setForm] = useState<{ name: string; content: string }>({ name: '', content: '' })
  const [sending, setSending] = useState<boolean>(false)
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
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
  useEffect(() => {
    fetchGuestbookMessages()
      .then((res) => {
        if (res.code === 200) {
          setMessages(res.data)
        } else {
          setError('加载留言失败')
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch messages:', err)
        setError('加载留言失败')
      })
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending || !form.name.trim() || !form.content.trim()) return

    // 检查是否配置了 token
    if (!GITHUB_TOKEN) {
      showToast('留言功能暂未开放，请联系站长 ✗')
      return
    }

    setSending(true)

    try {
      // 提交留言（创建 Issue）
      const result = await submitGuestbookMessage(form.name.trim(), form.content.trim(), GITHUB_TOKEN)

      if (result.code !== 200 || !result.data) {
        showToast('发送失败，请稍后重试 ✗')
        return
      }

      const newMsg: GuestbookMessage = {
        id: result.data.number,
        name: form.name.trim(),
        content: form.content.trim(),
        createdAt: result.data.created_at,
        avatar: form.name.trim().charAt(0).toUpperCase(),
      }
      setMessages([newMsg, ...messages])
      setForm({ name: '', content: '' })
      showToast('留言成功 ✓')
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
          <div className={`section-label ${visible ? 'visible' : ''}`}>Guestbook</div>
          <h2 className={`section-title ${visible ? 'visible' : ''}`}>留言板</h2>
          <p className={`section-desc ${visible ? 'visible' : ''}`}>
            欢迎留下你的想法、建议或只是打个招呼
          </p>
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
            {messages.map((msg: GuestbookMessage) => (
              <div key={msg.id} className="guestbook-item">
                <div className="guestbook-item__avatar">{msg.avatar}</div>
                <div className="guestbook-item__body">
                  <div className="guestbook-item__header">
                    <span className="guestbook-item__name">{msg.name}</span>
                    <time className="guestbook-item__time">{formatTime(msg.createdAt)}</time>
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
