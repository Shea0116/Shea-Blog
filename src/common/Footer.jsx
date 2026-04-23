import { useState } from 'react'
import './Footer.css'

export default function Footer() {
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

  return (
    <footer className="footer">
      {toast && <div className="toast">{toast}</div>}
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">S</span>
            <span className="footer__name">Shea</span>
          </div>
          <p className="footer__tagline">Crafting delightful user experiences, one component at a time.</p>
        </div>

        <div className="footer__divider" />

        <div className="footer__bottom">
          <span className="footer__copy">© {new Date().getFullYear()} Shea. All rights reserved.</span>
          <div className="footer__links">
            <button onClick={() => copyToClipboard('zrdl15@163.com')}>Email</button>
            <button onClick={() => copyToClipboard('https://github.com/Shea0116')}>GitHub</button>
            <button onClick={() => copyToClipboard('GavinShea')}>WeChat</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
