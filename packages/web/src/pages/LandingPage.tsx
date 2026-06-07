import { useState, Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"
import { LogoHorizontal } from "@/components/ui/Logo"
import ErrorBoundary from "@/components/ui/ErrorBoundary"

const CoinTossAnimation = lazy(() => import("@/components/three/CoinTossAnimation"))

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
          <LogoHorizontal />
          <div style={{display:"flex",gap:20}}>
            <button className="landing-nav-link" onClick={() => navigate("/history")}>历史记录</button>
            <button className="landing-nav-link" onClick={() => navigate(isLoggedIn?"/profile":"/login")}>
              {isLoggedIn ? "我的" : "登录"}
            </button>
          </div>
        </div>

        <div className="landing-hero">
          <h1 className="landing-brand">
            爻<span style={{color:"var(--accent-text)"}}>爻</span>
          </h1>
          <span className="landing-tagline">两难之间，以卦明辨</span>

          {/* 3D Coin Animation */}
          <ErrorBoundary fallback={null}>
            <Suspense fallback={<div style={{height:200}}/>}>
              <div style={{width:"100%",maxWidth:500,margin:"0 auto"}}>
                <CoinTossAnimation />
              </div>
            </Suspense>
          </ErrorBoundary>

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
