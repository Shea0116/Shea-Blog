import { useEffect, useRef, useState } from 'react'
import './About.css'
import { MailOutlined, GithubOutlined, WechatOutlined } from '@ant-design/icons';

const tags = ['React', 'Vue3', 'TypeScript', 'Node.js', 'Python', 'Java', 'React Native', 'ArkTS', 'Redux', 'Pinia', 'ECharts', 'SCSS']

export default function About() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [sent, setSent] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('复制成功 ✓')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showToast('复制成功 ✓')
    }
  }

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: '', contact: '', message: '' })
  }

  return (
    <section className="about" id="about" ref={ref}>
      {toast && <div className="toast">{toast}</div>}
      <div className="about__inner">
        <div className={`about__left ${visible ? 'visible' : ''}`}>
          <div className="section-label">About</div>
          <h2 className="section-title">关于我</h2>
          <p className="about__bio">
            我是 Shea（刘庚贤），一名前端开发工程师，目前就职于滴滴，曾就职于美团。3 年间从 ToB 企业系统到 ToC 大厂核心业务均有深度参与，
            主导过 150+ 组件鸿蒙适配、医疗 SKU 招商系统等重点项目。熟练掌握 React / Vue 全家桶，
            具备 ArkTS 跨端开发能力，持续关注前端工程化与性能优化。
          </p>

          <div className="about__meta">
            <div className="about__meta-item">
              <span className="about__meta-label">📍 位置</span>
              <span className="about__meta-value">北京</span>
            </div>
            <div className="about__meta-item">
              <span className="about__meta-label">💼 角色</span>
              <span className="about__meta-value">前端开发工程师</span>
            </div>
            <div className="about__meta-item">
              <span className="about__meta-label">🎓 经验</span>
              <span className="about__meta-value">3 年</span>
            </div>
            <div className="about__meta-item">
              <span className="about__meta-label">🏫 学历</span>
              <span className="about__meta-value">天津中德应用技术大学 · 本科</span>
            </div>
          </div>

          <div className="about__tags">
            {tags.map((t) => (
              <span style={{ userSelect: 'none' }} key={t} className="about__tag">{t}</span>
            ))}
          </div>
        </div>

        <div className={`about__right ${visible ? 'visible' : ''}`}>
          <div className="contact-card">
            <div className="contact-card__header">
              <h3 className="contact-card__title">快速联系</h3>
              <p className="contact-card__subtitle">有想法？随时聊聊</p>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className={`contact-field ${focusedField === 'name' ? 'focused' : ''}`}>
                <label>姓名</label>
                <input
                  type="text"
                  placeholder="你的称呼"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              <div className={`contact-field ${focusedField === 'contact' ? 'focused' : ''}`}>
                <label>联系方式</label>
                <input
                  type="text"
                  placeholder="邮箱 / 微信"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  onFocus={() => setFocusedField('contact')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              <div className={`contact-field ${focusedField === 'message' ? 'focused' : ''}`}>
                <label>消息</label>
                <textarea
                  placeholder="留下你的想法..."
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              <button type="submit" className={`contact-submit ${sent ? 'sent' : ''}`}>
                {sent ? '已发送 ✓' : '发送消息'}
                {!sent && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
            </form>
          </div>

          <div className="about__socials">
            <button className="social-link" onClick={() => copyToClipboard('zrdl15@163.com')}>
              <MailOutlined className="social-link__icon" />
              <span>Email</span>
            </button>
            <button className="social-link" onClick={() => copyToClipboard('https://github.com/Shea0116')}>
              <GithubOutlined className="social-link__icon" />
              <span>GitHub</span>
            </button>
            <button className="social-link" onClick={() => copyToClipboard('GavinShea')}>
              <WechatOutlined className="social-link__icon" />
              <span>WeChat</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
