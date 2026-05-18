import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react'

interface MagneticWrapProps {
  children: ReactNode
  className?: string
  strength?: number
  /** 是否启用，默认 true */
  enabled?: boolean
}

/**
 * 通用磁吸包裹组件 - 可以包裹任何元素，使其具有鼠标磁吸效果
 * 内部元素会跟随鼠标轻微偏移，产生磁吸感
 */
export default function MagneticWrap({
  children,
  className = '',
  strength = 0.25,
  enabled = true,
}: MagneticWrapProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!enabled || !wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    wrapRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`
  }, [strength, enabled])

  const handleMouseLeave = useCallback(() => {
    if (!wrapRef.current) return
    wrapRef.current.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`magnetic-wrap ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
