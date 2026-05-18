import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react'
import './MagneticButton.css'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
}

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  onClick,
  href,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const button = buttonRef.current
    const text = textRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    button.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    if (text) {
      text.style.transform = `translate(${deltaX * 0.5}px, ${deltaY * 0.5}px)`
    }
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    const button = buttonRef.current
    const text = textRef.current
    if (!button) return

    button.style.transform = 'translate(0, 0)'
    if (text) {
      text.style.transform = 'translate(0, 0)'
    }
  }, [])

  const Component = href ? 'a' : 'button'

  return (
    <Component
      ref={buttonRef as any}
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      href={href}
    >
      <span ref={textRef} className="magnetic-button__text">
        {children}
      </span>
    </Component>
  )
}
