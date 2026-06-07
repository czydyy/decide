import { useEffect, useState } from "react"

function Coin({ delay, left }: { delay: number; left: number }) {
  const [y, setY] = useState(0)
  const [rot, setRot] = useState(0)

  useEffect(() => {
    let frame: number
    const start = Date.now()
    const animate = () => {
      const t = (Date.now() - start) / 1000 + delay
      setY(Math.sin(t * 0.8) * 18)
      setRot(t * 60)
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(frame)
  }, [delay])

  return (
    <div
      style={{
        position: "absolute",
        left,
        width: 64, height: 64,
        transform: `translateY(${y}px) rotateY(${rot}deg)`,
        transition: "none",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Coin face */}
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "linear-gradient(135deg, #f6bc4f, #d4a030, #b8891e)",
        boxShadow: "0 4px 16px rgba(212,160,48,.4), inset 0 1px 0 rgba(255,255,255,.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 14, height: 14,
          background: "var(--bg, #faf8f3)",
          borderRadius: 3,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,.1)",
        }}/>
      </div>
    </div>
  )
}

export default function CoinTossAnimation() {
  return (
    <div style={{ width: "100%", height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <Coin delay={0} left={"calc(50% - 120px)"} />
      <Coin delay={1.2} left={"calc(50% - 32px)"} />
      <Coin delay={2.5} left={"calc(50% + 56px)"} />
    </div>
  )
}
