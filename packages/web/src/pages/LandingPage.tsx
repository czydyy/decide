import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"

const CHIPS = ["我该不该换工作？","要不要买这套房子？","这个时机创业合适吗？","这次投资能成功吗？"]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [method, setMethod] = useState<"yao"|"number"|"time">("yao")

  const start = () => {
    if (!q.trim()) return
    navigate(`/paipan?method=${method}&question=${encodeURIComponent(q.trim())}`)
    setOpen(false); setQ("")
  }

  if (open) {
    return (
      <div className="warm-bg">
        <div className="form-page">
          <div className="form-top">
            <button className="form-back" onClick={() => setOpen(false)}>←</button>
            <span style={{fontSize:19,fontWeight:700,color:"#f0ebe0",letterSpacing:2}}>起卦解惑</span>
          </div>
          <div className="form-body">
            <div className="dark-card">
              <span className="dark-card-label">你的困惑</span>
              <textarea className="q-textarea" placeholder="写下你正在纠结的事情……"
                value={q} onChange={e => setQ(e.target.value.slice(0,200))} maxLength={200} />
              <span className="q-count">{q.length}/200</span>
            </div>
            <div className="dark-card">
              <span className="dark-card-label">起卦方式</span>
              <div className="method-tabs">
                {[{k:"yao"as const,l:"铜钱起卦"},{k:"number"as const,l:"数字起卦"},{k:"time"as const,l:"时间起卦"}].map(m => (
                  <button key={m.k} onClick={() => setMethod(m.k)} className={`method-tab ${method===m.k?"on":""}`}>{m.l}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={start} disabled={!q.trim()} className="cta-btn">起卦解惑</button>
        </div>
      </div>
    )
  }

  return (
    <div className="warm-bg">
      <div className="landing">
        <div className="landing-nav">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <svg width="24" height="24" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="19" stroke="var(--ink)" strokeWidth="2" opacity="0.7"/>
              <path d="M21 2 L21 40" stroke="var(--ink)" strokeWidth="1.5" opacity="0.3"/>
              <circle cx="21" cy="21" r="7" fill="var(--ink)" opacity="0.6"/>
            </svg>
            <span style={{fontSize:18,fontWeight:700,color:"var(--ink)"}}>爻爻</span>
          </div>
          <div style={{display:"flex",gap:20}}>
            <button className="landing-nav-link" onClick={() => navigate("/history")}>历史记录</button>
            <button className="landing-nav-link" onClick={() => navigate(isLoggedIn?"/profile":"/login")}>
              {isLoggedIn ? "我的" : "登录"}
            </button>
          </div>
        </div>

        <div className="landing-hero">
          <div className="landing-icon">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="19" stroke="var(--ink)" strokeWidth="2" opacity="0.7"/>
              <path d="M21 2 L21 40" stroke="var(--ink)" strokeWidth="1.5" opacity="0.3"/>
              <circle cx="21" cy="21" r="7" fill="var(--ink)" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="landing-brand">爻爻</h1>
          <span className="landing-tagline">两难之间，以卦明辨</span>

          <div className="landing-chips">
            {CHIPS.map(c => (
              <button key={c} className="landing-chip" onClick={() => { setQ(c); setOpen(true) }}>{c}</button>
            ))}
          </div>

          <button className="landing-cta" onClick={() => setOpen(true)}>开始起卦</button>
        </div>
      </div>
    </div>
  )
}
