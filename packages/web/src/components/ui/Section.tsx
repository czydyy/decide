import type { ReactNode } from "react"

interface Props {
  label?: string
  children: ReactNode
  background?: "default" | "warm"
  size?: "md" | "sm"
}

export default function Section({ label, children, background = "default", size = "md" }: Props) {
  return (
    <section className={size === "sm" ? "section section-sm" : "section"}
      style={background === "warm" ? { background: "var(--bg-warm)" } : undefined}>
      {label && <span className="section-label" style={{ textAlign: "center" }}>{label}</span>}
      {children}
    </section>
  )
}
