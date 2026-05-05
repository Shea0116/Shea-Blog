import { useEffect, useState } from 'react'
import './PageLoader.css'

interface PageLoaderProps {
  onComplete: () => void
}

export default function PageLoader({ onComplete }: PageLoaderProps) {
  const [phase, setPhase] = useState<'hold' | 'exit'>('hold')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 1700)
    const t2 = setTimeout(onComplete, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete])

  return (
    <div className={`ploader ploader--${phase}`} aria-hidden="true">
      <div className="ploader__panel ploader__panel--left" />
      <div className="ploader__panel ploader__panel--right" />

      <div className="ploader__center">
        <div className="ploader__name">
          <span className="ploader__en">Shea</span>
          <span className="ploader__dot">·</span>
          <span className="ploader__cn">贤</span>
        </div>
        <div className="ploader__track">
          <div className="ploader__fill" />
        </div>
      </div>
    </div>
  )
}
