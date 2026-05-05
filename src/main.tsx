import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// GitHub Pages SPA 路由回退处理
const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  // 用 replaceState 修改 URL，不触发页面刷新
  window.history.replaceState(null, '', '/Shea-Blog' + redirect)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/Shea-Blog">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
