import type { ReactNode } from "react"

interface Props {
  left?: ReactNode
  right?: ReactNode
}

export default function NavBar({ left, right }: Props) {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto", padding: "24px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{left}</div>
      <div style={{ display: "flex", gap: 12 }}>{right}</div>
    </nav>
  )
}
