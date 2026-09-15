'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { birthdayContent, fireworksPalette, letterTiming } from '@/config/birthday-content'

const TOTAL_LINES = birthdayContent.letterLines.length

type Scene = 'intro' | 'letter' | 'birthday' | 'final'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  trail: { x: number; y: number }[]
}

function Fireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let raf = 0
    let width = 0
    let height = 0
    const particles: Particle[] = []
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const burst = (x: number, y: number, count: number, scale: number) => {
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.12
        const speed = (1.3 + Math.random() * 2.8) * scale
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, maxLife: 72 + Math.random() * 48, size: 0.8 + Math.random() * 1.7, color: fireworksPalette[index % fireworksPalette.length], trail: [] })
      }
    }

    const start = () => {
      resize()
      burst(width * 0.5, height * 0.34, reducedMotion ? 32 : 110, 1)
      if (!reducedMotion) window.setTimeout(() => burst(width * 0.24, height * 0.27, 52, 0.72), 680)
      if (!reducedMotion) window.setTimeout(() => burst(width * 0.78, height * 0.24, 60, 0.68), 1200)
      window.addEventListener('resize', resize)

      const draw = () => {
        frame += 1
        context.fillStyle = 'rgba(8, 14, 31, 0.16)'
        context.fillRect(0, 0, width, height)
        for (let index = particles.length - 1; index >= 0; index -= 1) {
          const particle = particles[index]
          particle.trail.push({ x: particle.x, y: particle.y })
          if (particle.trail.length > 4) particle.trail.shift()
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.014
          particle.vx *= 0.992
          particle.life += 1
          const opacity = Math.max(0, 1 - particle.life / particle.maxLife)
          context.beginPath()
          context.moveTo(particle.x, particle.y)
          context.lineTo(particle.trail[0]?.x ?? particle.x, particle.trail[0]?.y ?? particle.y)
          context.strokeStyle = `${particle.color}${Math.round(opacity * 150).toString(16).padStart(2, '0')}`
          context.lineWidth = particle.size
          context.stroke()
          context.beginPath()
          context.arc(particle.x, particle.y, particle.size * 1.35, 0, Math.PI * 2)
          context.fillStyle = `${particle.color}${Math.round(opacity * 210).toString(16).padStart(2, '0')}`
          context.fill()
          if (particle.life > particle.maxLife) particles.splice(index, 1)
        }
        if (frame < 500 || particles.length > 0) raf = requestAnimationFrame(draw)
      }
      draw()
    }

    start()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return <canvas ref={canvasRef} aria-hidden="true" className={`fireworks ${active ? 'fireworks-visible' : ''}`} />
}

function Atmosphere() {
  return <div aria-hidden="true" className="atmosphere"><div className="nebula" /><div className="stars stars-one" /><div className="stars stars-two" /><div className="grain" /></div>
}

export function BirthdayExperience() {
  const [scene, setScene] = useState<Scene>('intro')
  const [lineIndex, setLineIndex] = useState(0)
  const [isOpening, setIsOpening] = useState(false)

  const begin = useCallback(() => {
    setIsOpening(true)
    window.setTimeout(() => {
      setScene('letter')
      setLineIndex(0)
      setIsOpening(false)
    }, 650)
  }, [])

  const advance = useCallback(() => {
    if (scene !== 'letter') return
    if (lineIndex < TOTAL_LINES - 1) {
      setLineIndex((current) => current + 1)
    } else {
      setScene('birthday')
      window.setTimeout(() => setScene('final'), letterTiming.finaleDelay)
    }
  }, [lineIndex, scene])

  const replay = () => {
    setScene('intro')
    setLineIndex(0)
    setIsOpening(false)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (scene === 'intro') begin()
        else if (scene === 'letter') advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, begin, scene])

  return (
    <main className={`birthday-experience scene-${scene}`}>
      <Atmosphere />
      <Fireworks active={scene === 'birthday'} />
      <div className="experience-content">
        {scene === 'intro' && <section className={`intro-scene ${isOpening ? 'intro-opening' : ''}`} aria-labelledby="intro-title">
          <p className="eyebrow">A private little moment</p>
          <div className="intro-mark" aria-hidden="true">✦</div>
          <h1 id="intro-title">{birthdayContent.intro}</h1>
          <button className="open-button" type="button" onClick={begin} autoFocus>
            <span>{birthdayContent.openLabel}</span><span aria-hidden="true">✦</span>
          </button>
          <p className="hint">Tap to begin</p>
        </section>}

        {scene === 'letter' && <section className="letter-scene" aria-live="polite" aria-labelledby="letter-title" onClick={advance}>
          <div className="letter-rule" />
          <p className="eyebrow">For {birthdayContent.recipient}</p>
          <h2 id="letter-title" className="letter-text">
            {birthdayContent.letterLines[lineIndex].includes('💜') 
              ? (
                <>
                  {birthdayContent.letterLines[lineIndex].split('💜').map((part, index) => (
                    index === 0 ? part : <><span className="heart-small" key="heart">💜</span>{part}</>
                  ))}
                </>
              )
              : birthdayContent.letterLines[lineIndex]}
          </h2>
          <div className="letter-footer"><span>{String(lineIndex + 1).padStart(2, '0')}</span><span className="progress-dots">{birthdayContent.letterLines.map((_, index) => <i key={index} className={index <= lineIndex ? 'active' : ''} />)}</span><span>{String(TOTAL_LINES).padStart(2, '0')}</span></div>
          <p className="tap-hint">Tap anywhere to continue</p>
        </section>}

        {scene === 'birthday' && <section className="birthday-scene" aria-live="polite" aria-labelledby="birthday-title">
          <p className="eyebrow birthday-eyebrow">For a very special person</p>
          <h2 id="birthday-title">
            <span>{birthdayContent.birthday.split('💜').map((part, index) => (
              index === 0 ? part : <><span className="heart-small" key="heart">💜</span>{part}</>
            ))}</span><em>✦</em>
          </h2>
          <p className="wish-line">{birthdayContent.finalWish}</p>
        </section>}

        {scene === 'final' && <section className="final-scene" aria-live="polite">
          <p className="eyebrow">And one last thing</p>
          <h2>{birthdayContent.finalWish}</h2>
          <div className="final-star" aria-hidden="true">✦</div>
          <button type="button" className="replay-button" onClick={replay}>Replay <span aria-hidden="true">↗</span></button>
        </section>}
      </div>
    </main>
  )
}

export default BirthdayExperience
