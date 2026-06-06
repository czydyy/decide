import type { ReactNode, HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "glass"
  padding?: "sm" | "md" | "lg"
  children: ReactNode
}

export default function Card({
  variant = "default",
  padding = "md",
  children,
  className = "",
  ...rest
}: CardProps) {
  const variants: Record<string, string> = {
    default: "bg-clean-card border border-clean-border shadow-card",
    dark: "bg-[rgba(20,16,12,0.78)] backdrop-blur-lg border border-white/10 text-white",
    glass: "glass-card shadow-card",
  }

  const paddings: Record<string, string> = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  return (
    <div
      className={`rounded-md ${variants[variant]} ${paddings[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
