interface TabItem { key: string; label: string }
interface Props { items: TabItem[]; active: string; onChange: (key: string) => void }

export default function Tabs({ items, active, onChange }: Props) {
  return (
    <div className="tab-row">
      {items.map(item => (
        <button key={item.key} onClick={() => onChange(item.key)} className={`tab ${item.key === active ? "on" : ""}`}>
          {item.label}
        </button>
      ))}
    </div>
  )
}
