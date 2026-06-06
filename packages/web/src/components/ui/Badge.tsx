import type { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "gold"
}

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-white/10 text-white border border-white/20",
    gold: "bg-gold-soft text-gold-text border border-gold/30",
  }

  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${variants[variant]}`}>
      {children}
    </span>
  )
}
