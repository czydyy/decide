/** Simple wordmark — just the name, well-set */
export function LogoHorizontal({ size = 18 }: { size?: number }) {
  return (
    <span style={{
      fontSize: size,
      fontWeight: 700,
      color: "var(--ink)",
      letterSpacing: "0.08em",
    }}>
      爻<span style={{ color: "var(--accent)" }}>爻</span>
    </span>
  )
}
