import { useEffect, useRef } from 'react'
import type { ParticleMode } from '../lib/celebrations'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  rotation: number
  vRot: number
  life: number
  maxLife: number
  type: 'petal' | 'confetti' | 'spark' | 'rocket' | 'flower'
}

type Props = {
  mode: ParticleMode
  active: boolean
}

const PALETTES = {
  petals: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48'],
  confetti: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#facc15'],
  crackers_flowers: ['#a855f7', '#ec4899', '#f43f5e', '#34d399', '#fbbf24', '#f472b6'],
  golden_fireworks: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706', '#ffffff', '#fb923c'],
}

export function CelebrationCanvas({ mode, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles: Particle[] = []

    const spawnPetal = (): Particle => ({
      x: Math.random() * width,
      y: -20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.2 + Math.random() * 2,
      size: 8 + Math.random() * 8,
      color: PALETTES.petals[Math.floor(Math.random() * PALETTES.petals.length)],
      alpha: 0.8 + Math.random() * 0.2,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife: 400 + Math.random() * 200,
      type: 'petal',
    })

    const spawnConfetti = (): Particle => ({
      x: Math.random() * width,
      y: -15,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3.5,
      size: 6 + Math.random() * 6,
      color: PALETTES.confetti[Math.floor(Math.random() * PALETTES.confetti.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,
      life: 0,
      maxLife: 350 + Math.random() * 150,
      type: 'confetti',
    })

    const spawnFireworkBurst = (bx: number, by: number, count = 40, colors = PALETTES.golden_fireworks) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2
        const speed = 2 + Math.random() * 4.5
        particles.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          rotation: 0,
          vRot: 0,
          life: 0,
          maxLife: 70 + Math.random() * 50,
          type: 'spark',
        })
      }
    }

    const spawnFlowerBurst = (bx: number, by: number) => {
      const colors = PALETTES.crackers_flowers
      for (let i = 0; i < 28; i++) {
        const angle = (Math.PI * 2 * i) / 28
        const speed = 1.5 + Math.random() * 3
        particles.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 5 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 4,
          life: 0,
          maxLife: 90 + Math.random() * 40,
          type: 'flower',
        })
      }
    }

    // Initial burst
    if (mode === 'petals') {
      for (let i = 0; i < 40; i++) particles.push(spawnPetal())
    } else if (mode === 'confetti') {
      for (let i = 0; i < 70; i++) particles.push(spawnConfetti())
    } else if (mode === 'golden_fireworks') {
      spawnFireworkBurst(width * 0.3, height * 0.35, 50)
      spawnFireworkBurst(width * 0.7, height * 0.3, 50)
    } else if (mode === 'crackers_flowers') {
      spawnFlowerBurst(width * 0.35, height * 0.4)
      spawnFlowerBurst(width * 0.65, height * 0.45)
    }

    let frame = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      frame++

      // Continuous spawning
      if (mode === 'petals' && frame % 12 === 0 && particles.length < 50) {
        particles.push(spawnPetal())
      } else if (mode === 'confetti' && frame % 8 === 0 && particles.length < 75) {
        particles.push(spawnConfetti())
      } else if (mode === 'golden_fireworks' && frame % 80 === 0) {
        const rx = width * (0.2 + Math.random() * 0.6)
        const ry = height * (0.2 + Math.random() * 0.35)
        spawnFireworkBurst(rx, ry, 45)
      } else if (mode === 'crackers_flowers' && frame % 70 === 0) {
        const rx = width * (0.2 + Math.random() * 0.6)
        const ry = height * (0.25 + Math.random() * 0.3)
        spawnFlowerBurst(rx, ry)
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vRot

        // Gravity / drag
        if (p.type === 'spark' || p.type === 'flower') {
          p.vy += 0.05 // gravity
          p.vx *= 0.98
          p.vy *= 0.98
          p.alpha = Math.max(0, 1 - p.life / p.maxLife)
        } else if (p.type === 'petal') {
          p.vx += Math.sin(p.life * 0.03) * 0.05
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)

        if (p.type === 'petal' || p.type === 'flower') {
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.type === 'confetti') {
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.6)
        } else if (p.type === 'spark') {
          ctx.fillStyle = p.color
          ctx.shadowBlur = 8
          ctx.shadowColor = p.color
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        if (p.life >= p.maxLife || p.y > height + 40) {
          particles.splice(i, 1)
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [mode, active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  )
}
