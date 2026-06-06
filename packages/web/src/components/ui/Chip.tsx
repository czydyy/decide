interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${
        active
          ? "bg-gold-soft border-gold text-gold-text"
          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  )
}
