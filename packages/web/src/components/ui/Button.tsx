import type { ButtonHTMLAttributes, ReactNode } from "react"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

export default function Button({ variant = "primary", size = "md", loading, children, className = "", disabled, ...rest }: Props) {
  const base = "btn"
  const v = { primary: "btn-primary", outline: "btn-outline", ghost: "btn-ghost" }[variant]
  const s = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : ""
  return <button className={`${base} ${v} ${s} ${className}`} disabled={disabled || loading} {...rest}>{children}</button>
}
