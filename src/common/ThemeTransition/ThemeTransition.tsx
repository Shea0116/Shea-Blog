import { useEffect, useRef, useState } from 'react'
import './ThemeTransition.css'

interface ThemeTransitionProps {
  isDark: boolean
  children: React.ReactNode
}

/**
 * 圆形扩散主题切换过渡效果
 * 从点击位置向外扩散圆形遮罩，切换主题色
 */
export default function ThemeTransition({ isDark, children }: ThemeTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [clipPos, setClipPos] = useState({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)
  const lastTogglePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // 监听主题切换按钮点击位置
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 检测是否点击了主题切换按钮
      if (target.closest('.nav__theme-btn')) {
        lastTogglePos.current = { x: e.clientX, y: e.clientY }
      }
    }
    window.addEventListener('click', handleClick, { passive: true })
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // 监听主题变化触发动画
  useEffect(() => {
    if (!overlayRef.current) return

    setIsAnimating(true)
    setClipPos(lastTogglePos.current)

    // 展开动画
    requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.add('expanding')
      }
    })

    // 动画结束后清理
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.remove('expanding')
      }
      setIsAnimating(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [isDark])

  return (
    <>
      {children}
      {/* 圆形扩散遮罩 */}
      {isAnimating && (
        <div
          ref={overlayRef}
          className="theme-transition-overlay"
          style={{
            '--clip-x': `${clipPos.x}px`,
            '--clip-y': `${clipPos.y}px`,
          } as React.CSSProperties}
        />
      )}
    </>
  )
}
