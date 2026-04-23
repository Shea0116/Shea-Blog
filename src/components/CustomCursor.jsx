import { useRef, useEffect, useState } from 'react'
import './CustomCursor.css'

const LERP = 0.12

export default function CustomCursor({ mouse }) {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const dotPos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const [dotStyle, setDotStyle] = useState({})
  const [ringStyle, setRingStyle] = useState({})
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    let animId
    const animate = () => {
      dotPos.current.x += (mouse.x - dotPos.current.x) * 0.25
      dotPos.current.y += (mouse.y - dotPos.current.y) * 0.25
      ringPos.current.x += (mouse.x - ringPos.current.x) * LERP
      ringPos.current.y += (mouse.y - ringPos.current.y) * LERP

      setDotStyle({
        transform: `translate(${dotPos.current.x - 4}px, ${dotPos.current.y - 4}px) scale(${isHovering ? 0.5 : isClicking ? 0.8 : 1})`,
      })
      setRingStyle({
        transform: `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px) scale(${isHovering ? 1.8 : isClicking ? 0.9 : 1})`,
        opacity: isHovering ? 0.6 : 0.3,
      })

      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [mouse, isHovering, isClicking])

  useEffect(() => {
    const handleOver = (e) => {
      const target = e.target.closest('a, button, [data-cursor="pointer"], .skill-card, .project-card, .about-tag, .link-item, .submit-btn')
      setIsHovering(!!target)
    }
    const handleDown = () => setIsClicking(true)
    const handleUp = () => setIsClicking(false)

    document.addEventListener('mouseover', handleOver, { passive: true })
    document.addEventListener('mousedown', handleDown, { passive: true })
    document.addEventListener('mouseup', handleUp, { passive: true })
    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [])

  return (
    <div className="cursor-wrap">
      <div ref={dotRef} className="cursor-dot" style={dotStyle} />
      <div ref={ringRef} className="cursor-ring" style={ringStyle} />
    </div>
  )
}
