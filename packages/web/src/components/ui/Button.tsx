import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"

  const variants: Record<string, string> = {
    primary:
      "bg-accent text-white hover:bg-accent-hover shadow-cta hover:shadow-lg active:scale-[0.98]",
    outline:
      "border-2 border-white/30 text-white hover:bg-white/10",
    ghost:
      "text-ink-sec hover:text-ink hover:bg-ink/5",
  }

  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner small />}
      {children}
    </button>
  )
}

function Spinner({ small }: { small?: boolean }) {
  return (
    <span
      className={`inline-block border-2 border-white/30 border-t-white rounded-full animate-spin ${
        small ? "w-4 h-4" : "w-5 h-5"
      }`}
    />
  )
}
