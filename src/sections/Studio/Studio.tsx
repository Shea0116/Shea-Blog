import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDownOutlined, ArrowRightOutlined, BookOutlined, CloseOutlined, DesktopOutlined, IdcardOutlined, MailOutlined, ReloadOutlined, StarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import type { ExhibitId } from './studioModel'
import type { createStudioView } from './studioView'
import './Studio.css'

const exhibits = {
  projects: {
    name: '项目', object: '工作台', title: '开发项目', icon: DesktopOutlined,
    description: '看看我做过的项目，了解每个项目的实现过程与技术取舍。',
    action: '浏览项目', to: '/projects',
  },
  blog: {
    name: '博客', object: '书架', title: '技术博客', icon: BookOutlined,
    description: '这里收录了我在前端、后端开发中写下的技术文章。',
    action: '浏览文章', to: '/blog',
  },
  about: {
    name: '关于我', object: '墙上的画', title: '认识 Shea', icon: IdcardOutlined,
    description: '我是 Shea，也叫贤。我做前端和跨端开发，在这里记录项目、学习和实践。',
    action: '阅读个人介绍', href: '#about',
  },
  favorites: {
    name: '收藏', object: '唱片柜', title: '我的收藏夹', icon: StarOutlined,
    description: '这里收着我想留给自己、也想分享给你的链接。',
    action: '查看收藏', to: '/favorites',
  },
  guestbook: {
    name: '留言', object: '桌上的信', title: '给我留封信', icon: MailOutlined,
    description: '有项目想聊，或者只是路过想打个招呼，都可以在这里留言。',
    action: '打开留言板', to: '/guestbook',
  },
} as const

const exhibitIds = Object.keys(exhibits) as ExhibitId[]

export default memo(function Studio({ day }: { day: boolean }) {
  const [mode, setMode] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [active, setActive] = useState<ExhibitId | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const labels = useRef<Partial<Record<ExhibitId, HTMLButtonElement>>>({})
  const viewRef = useRef<ReturnType<typeof createStudioView> | null>(null)
  const activeRef = useRef<ExhibitId | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const dayRef = useRef(day)

  const select = useCallback((id: ExhibitId) => {
    if (activeRef.current) return
    activeRef.current = id
    setActive(id)
    const delay = viewRef.current?.focus(id) ?? 0
    timer.current = window.setTimeout(() => dialogRef.current?.showModal(), delay)
  }, [])

  const close = useCallback((restoreFocus = true) => {
    const id = activeRef.current
    if (!id) return
    window.clearTimeout(timer.current)
    activeRef.current = null
    setActive(null)
    viewRef.current?.focus(null)
    dialogRef.current?.close()
    if (restoreFocus) labels.current[id]?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    dayRef.current = day
    viewRef.current?.setDay(day)
  }, [day])

  useEffect(() => {
    let cancelled = false
    function useFallback() {
      if (cancelled) return
      viewRef.current?.dispose()
      viewRef.current = null
      setMode('fallback')
    }

    const timeout = window.setTimeout(useFallback, 6500)
    void import('./studioView').then(({ createStudioView }) => {
      if (cancelled || !stageRef.current) return
      const scene = createStudioView(stageRef.current, {
        labels: labels.current,
        onSelect: select,
        onLost: useFallback,
      })
      viewRef.current = scene
      scene.setDay(dayRef.current)
      setMode('ready')
    }).catch(useFallback).finally(() => window.clearTimeout(timeout))

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      window.clearTimeout(timer.current)
      viewRef.current?.dispose()
      viewRef.current = null
    }
  }, [select])

  useEffect(() => {
    function cancelFlight(event: KeyboardEvent) {
      if (event.key === 'Escape' && activeRef.current && !dialogRef.current?.open) close()
    }
    window.addEventListener('keydown', cancelFlight)
    return () => window.removeEventListener('keydown', cancelFlight)
  }, [close])

  const detail = active ? exhibits[active] : null

  return (
    <section className="studio" aria-labelledby="studio-title">
      <div className="studio__layout">
        <div className="studio__intro">
          <h1 id="studio-title">Shea<span>的工作室</span></h1>
          <p>我是 Shea（贤），一名前端开发者。这里摆着我的项目、文章，还有一些想分享的收藏。</p>
          <div className="studio__actions">
            <Link to="/projects" className="studio__primary">查看项目 <ArrowRightOutlined /></Link>
            <a href="#about" className="studio__text-link">关于我 <ArrowDownOutlined /></a>
          </div>
        </div>

        <div className="studio__world" data-mode={mode} data-active={active ? '' : undefined}>
          <div className="studio__stage" ref={stageRef} aria-label="工作室导览" role="group">
            {exhibitIds.map((id) => {
              const exhibit = exhibits[id]
              const Icon = exhibit.icon
              return (
                <button
                  type="button"
                  key={id}
                  ref={(element) => {
                    if (element) labels.current[id] = element
                    else delete labels.current[id]
                  }}
                  className="studio__stop"
                  data-exhibit={id}
                  aria-haspopup="dialog"
                  aria-label={`${exhibit.name} · ${exhibit.object}`}
                  onPointerEnter={() => viewRef.current?.hover(id)}
                  onPointerLeave={() => viewRef.current?.hover(null)}
                  onFocus={() => viewRef.current?.hover(id)}
                  onBlur={() => viewRef.current?.hover(null)}
                  onClick={() => select(id)}
                >
                  <Icon />
                  <span>{exhibit.name}</span>
                  <span className="studio__stop-object">{exhibit.object}</span>
                  <ArrowRightOutlined className="studio__stop-arrow" />
                </button>
              )
            })}
          </div>
          <div className="studio__instructions">
            <p role="status">
              {mode === 'ready' ? '拖动房间旋转，点击物件探索' : mode === 'loading' ? '正在搭建 3D 房间…' : '当前显示文字导览'}
            </p>
            {mode === 'ready' && (
              <button type="button" className="studio__reset" onClick={() => viewRef.current?.reset()}>
                <ReloadOutlined /> 重置视角
              </button>
            )}
          </div>
        </div>
      </div>

      <dialog
        className="studio__dialog"
        ref={dialogRef}
        aria-labelledby="studio-panel-title"
        aria-describedby="studio-panel-description"
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        {detail && (
          <div className="studio__panel">
            <button type="button" className="studio__close" aria-label="返回房间" autoFocus onClick={() => close()}>
              <CloseOutlined />
            </button>
            <detail.icon className="studio__panel-icon" />
            <h2 id="studio-panel-title">{detail.title}</h2>
            <p id="studio-panel-description">{detail.description}</p>
            {'to' in detail ? (
              <Link className="studio__primary" to={detail.to} onClick={() => close(false)}>
                {detail.action} <ArrowRightOutlined />
              </Link>
            ) : (
              <a
                className="studio__primary"
                href={detail.href}
                onClick={() => close(false)}
              >
                {detail.action} <ArrowRightOutlined />
              </a>
            )}
          </div>
        )}
      </dialog>
    </section>
  )
})
