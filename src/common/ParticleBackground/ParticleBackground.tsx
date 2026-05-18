import { useEffect, useRef, useCallback } from 'react'
import './ParticleBackground.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseOpacity: number
  opacity: number
  color: string
  twinkleSpeed: number
  twinkleOffset: number
}

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface Meteor {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  life: number
  maxLife: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
}

interface MouseState {
  x: number
  y: number
  radius: number
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const meteorsRef = useRef<Meteor[]>([])
  const ripplesRef = useRef<Ripple[]>([])
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, radius: 160 })
  const rafRef = useRef<number>(0)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const timeRef = useRef<number>(0)
  const lastMeteorTime = useRef<number>(0)

  const particleColors = ['#818cf8', '#a78bfa', '#c084fc', '#6366f1', '#8b5cf6']

  // 初始化星星（静态背景层）
  const initStars = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 8000), 120)
    const stars: Star[] = []
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      })
    }
    starsRef.current = stars
  }, [])

  // 初始化粒子（动态交互层）
  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 25000), 50)
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        baseOpacity: Math.random() * 0.4 + 0.2,
        opacity: 0,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        twinkleSpeed: Math.random() * 0.015 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles
  }, [])

  // 生成流星
  const spawnMeteor = useCallback((width: number) => {
    const meteor: Meteor = {
      x: Math.random() * width * 1.2,
      y: -20,
      length: Math.random() * 80 + 60,
      speed: Math.random() * 6 + 4,
      angle: (Math.random() * 0.3 + 0.5), // 弧度
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    }
    meteorsRef.current.push(meteor)
  }, [])

  // 生成涟漪
  const spawnRipple = useCallback((x: number, y: number) => {
    const ripple: Ripple = {
      x,
      y,
      radius: 0,
      maxRadius: 80 + Math.random() * 40,
      opacity: 0.4,
    }
    ripplesRef.current.push(ripple)
  }, [])

  // 主渲染循环
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const { width, height } = canvas
    const particles = particlesRef.current
    const stars = starsRef.current
    const meteors = meteorsRef.current
    const ripples = ripplesRef.current
    const mouse = mouseRef.current
    const time = timeRef.current

    ctx.clearRect(0, 0, width, height)

    // ── 1. 绘制星星（闪烁） ──
    stars.forEach((star) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
      const alpha = star.opacity * (0.5 + twinkle * 0.5)
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200, 200, 255, ${alpha})`
      ctx.fill()

      // 较亮的星星加十字光芒
      if (star.radius > 1 && alpha > 0.5) {
        ctx.strokeStyle = `rgba(200, 200, 255, ${alpha * 0.3})`
        ctx.lineWidth = 0.5
        const len = star.radius * 3
        ctx.beginPath()
        ctx.moveTo(star.x - len, star.y)
        ctx.lineTo(star.x + len, star.y)
        ctx.moveTo(star.x, star.y - len)
        ctx.lineTo(star.x, star.y + len)
        ctx.stroke()
      }
    })

    // ── 2. 绘制粒子 + 连线 ──
    particles.forEach((particle) => {
      // 闪烁
      const twinkle = Math.sin(time * particle.twinkleSpeed + particle.twinkleOffset)
      particle.opacity = particle.baseOpacity * (0.6 + twinkle * 0.4)

      // 鼠标吸引
      const dx = mouse.x - particle.x
      const dy = mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < mouse.radius && distance > 0) {
        const force = (mouse.radius - distance) / mouse.radius
        const angle = Math.atan2(dy, dx)
        particle.vx += Math.cos(angle) * force * 0.015
        particle.vy += Math.sin(angle) * force * 0.015
      }

      // 更新位置
      particle.x += particle.vx
      particle.y += particle.vy

      // 边界
      if (particle.x < 0 || particle.x > width) particle.vx *= -1
      if (particle.y < 0 || particle.y > height) particle.vy *= -1

      // 限速
      const maxSpeed = 1.2
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed
        particle.vy = (particle.vy / speed) * maxSpeed
      }

      // 绘制粒子光晕
      const glow = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 4
      )
      glow.addColorStop(0, particle.color)
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.globalAlpha = particle.opacity * 0.25
      ctx.fill()

      // 绘制粒子核心
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.opacity
      ctx.fill()
    })

    // 粒子间连线
    ctx.lineWidth = 0.4
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 140) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.globalAlpha = (1 - dist / 140) * 0.15
          ctx.strokeStyle = '#818cf8'
          ctx.stroke()
        }
      }
      // 鼠标连线
      if (mouse.x > 0 && mouse.y > 0) {
        const dx = particles[i].x - mouse.x
        const dy = particles[i].y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.globalAlpha = (1 - dist / 200) * 0.25
          ctx.strokeStyle = '#c084fc'
          ctx.stroke()
        }
      }
    }

    // ── 3. 绘制流星 ──
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]
      m.life++
      m.x += Math.cos(m.angle) * m.speed
      m.y += Math.sin(m.angle) * m.speed
      m.opacity = 1 - m.life / m.maxLife

      if (m.life >= m.maxLife) {
        meteors.splice(i, 1)
        continue
      }

      const tailX = m.x - Math.cos(m.angle) * m.length
      const tailY = m.y - Math.sin(m.angle) * m.length

      const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.6, `rgba(200, 180, 255, ${m.opacity * 0.3})`)
      gradient.addColorStop(1, `rgba(255, 255, 255, ${m.opacity * 0.8})`)

      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(m.x, m.y)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 1
      ctx.stroke()

      // 流星头部光点
      ctx.beginPath()
      ctx.arc(m.x, m.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`
      ctx.fill()
    }

    // ── 4. 绘制涟漪 ──
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]
      r.radius += 2
      r.opacity -= 0.008

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1)
        continue
      }

      ctx.beginPath()
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(129, 140, 248, ${r.opacity})`
      ctx.lineWidth = 1
      ctx.globalAlpha = 1
      ctx.stroke()
    }

    // ── 5. 鼠标光晕 ──
    if (mouse.x > 0 && mouse.y > 0) {
      const mouseGlow = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 100
      )
      mouseGlow.addColorStop(0, 'rgba(129, 140, 248, 0.06)')
      mouseGlow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2)
      ctx.fillStyle = mouseGlow
      ctx.globalAlpha = 1
      ctx.fill()
    }

    ctx.globalAlpha = 1
    timeRef.current++

    // 随机生成流星
    if (timeRef.current - lastMeteorTime.current > 180 + Math.random() * 300) {
      spawnMeteor(width)
      lastMeteorTime.current = timeRef.current
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [spawnMeteor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars(canvas.width, canvas.height)
      initParticles(canvas.width, canvas.height)
    }

    let rippleTimer: number | null = null
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY

      // 节流涟漪
      if (!rippleTimer) {
        rippleTimer = window.setTimeout(() => {
          spawnRipple(e.clientX, e.clientY)
          rippleTimer = null
        }, 800)
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = 0
      mouseRef.current.y = 0
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)
    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
      if (rippleTimer) clearTimeout(rippleTimer)
    }
  }, [initStars, initParticles, draw, spawnRipple])

  return <canvas ref={canvasRef} className="particle-background" />
}
