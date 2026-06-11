import { useEffect, useRef } from "react"

interface Particle {
  x: number; y: number; vx: number; vy: number
  r: number; glow: number; alpha: number
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth
      canvas.height = canvas.offsetHeight || window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.2 + 0.3,
        glow: Math.random() * 12 + 5,
        alpha: Math.random() * 0.25 + 0.05,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Radial glow — Evervault's particle style
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glow)
        g.addColorStop(0, `rgba(200,160,100,${p.alpha})`)
        g.addColorStop(0.4, `rgba(180,120,60,${p.alpha * 0.5})`)
        g.addColorStop(1, "rgba(180,120,60,0)")
        ctx.fillStyle = g
        ctx.fillRect(p.x - p.glow, p.y - p.glow, p.glow * 2, p.glow * 2)

        // Bright core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(244,180,100,${p.alpha * 1.5})`
        ctx.fill()
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.55,
      }}
    />
  )
}
