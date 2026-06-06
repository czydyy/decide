import type { ButtonHTMLAttributes } from "react"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export default function Chip({ active, className = "", ...rest }: Props) {
  return <button className={`chip ${active ? "active" : ""} ${className}`} {...rest} />
}
