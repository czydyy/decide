import type { HTMLAttributes, ReactNode } from "react"

interface Props extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean
  padding?: "sm" | "md" | "xl"
  children: ReactNode
}

export default function Card({ accent, padding = "md", children, className = "", ...rest }: Props) {
  const cls = accent ? "card-accent" : "card"
  const p = padding === "sm" ? "card-sm" : padding === "xl" ? "card-xl" : ""
  return <div className={`${cls} ${p} ${className}`} {...rest}>{children}</div>
}
