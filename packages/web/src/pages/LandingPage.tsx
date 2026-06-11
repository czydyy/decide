import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"
import ParticleBackground from "@/components/effects/ParticleBackground"

/* ================================================================
   LandingPage — Evervault 1:1 clone adapted for 爻爻 I Ching
   All dynamic effects: shimmer, flicker, blink, scroll reveal,
   card hover tilt, gradient pulse, particle drift
   ================================================================ */

const hexagrams = [
  { symbol: "䷀", name: "乾为天", desc: "元亨利贞", lines: "——— ———" },
  { symbol: "䷁", name: "坤为地", desc: "厚德载物", lines: "— — — —" },
  { symbol: "䷂", name: "水雷屯", desc: "勿用有攸往", lines: "— — ———" },
  { symbol: "䷃", name: "山水蒙", desc: "童蒙求我", lines: "——— — —" },
  { symbol: "䷄", name: "水天需", desc: "有孚光亨", lines: "——— ———" },
  { symbol: "䷅", name: "天水讼", desc: "有孚窒惕", lines: "— — ———" },
]

const encryptData = [
  "䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿",
  "☰☱☲☳☴☵☶☷ 初九·九二·九三·六四·九五·上九 元亨利贞 自天祐之 吉无不利",
  "䷀乾·䷁坤·䷂屯·䷃蒙·䷄需·䷅讼·䷆师 八卦相荡 六爻发挥 刚柔相摩",
  "⚊⚋⚊⚋⚊⚋ 潜龙勿用·见龙在田·终日乾乾·或跃在渊·飞龙在天·亢龙有悔",
  "初爻·二爻·三爻·四爻·五爻·上爻 六位时成 时乘六龙以御天 云行雨施",
  "太极生两仪 两仪生四象 四象生八卦 八卦定吉凶 吉凶生大业 易简天下之理",
]

const features = [
  { icon: "🪙", title: "铜钱起卦", desc: "传统三钱六摇法，AI 辅助定卦推象，传承千年六爻智慧" },
  { icon: "🔢", title: "数字起卦", desc: "随心取数，即时成卦，方便快捷，随时随地洞察天机" },
  { icon: "🕐", title: "时间起卦", desc: "以年月日时入卦，天地人和，顺时应势而断" },
  { icon: "🤖", title: "AI 解卦", desc: "融合《周易》原文与流式 AI，逐爻详解，深入浅出" },
  { icon: "📜", title: "历史回溯", desc: "保存每一次占卜记录，复盘人生重大决策" },
  { icon: "🔮", title: "隐私优先", desc: "端到端加密保护，你的卦象与困惑只有你知道" },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [method, setMethod] = useState<"yao" | "number" | "time">("yao")

  // ===== SCROLL REVEAL (Evervault: IntersectionObserver) =====
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-visible")
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" })
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ============= INLINE QIGUA FORM =============
  if (open) return (
    <div style={{
      minHeight: "100vh", background: "#010314", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 520 }} className="anim-in">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <button onClick={() => setOpen(false)} className="btn-ghost">← 返回</button>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", margin: 0 }}>起卦解惑</h2>
        </div>
        <div className="card" style={{ marginBottom: 12 }}>
          <span className="section-label">你的困惑</span>
          <textarea className="textarea" placeholder="静心凝神，写下你正在纠结的事情……"
            value={q} onChange={e => setQ(e.target.value.slice(0, 200))} maxLength={200} />
          <span className="char-count">{q.length}/200</span>
        </div>
        <div className="card" style={{ marginBottom: 24 }}>
          <span className="section-label">起卦方式</span>
          <div className="tab-row">
            {([{ k: "yao" as const, l: "铜钱" }, { k: "number" as const, l: "数字" }, { k: "time" as const, l: "时间" }] as const).map(m => (
              <button key={m.k} onClick={() => setMethod(m.k)} className={`tab ${method === m.k ? "on" : ""}`}>{m.l}</button>
            ))}
          </div>
        </div>
        <button onClick={() => {
          if (!q.trim()) return
          navigate(`/paipan?method=${method}&question=${encodeURIComponent(q.trim())}`)
          setOpen(false); setQ("")
        }} disabled={!q.trim()} className="btn btn-primary" style={{ width: "100%", padding: "14px 32px", fontSize: "0.95rem" }}>
          起卦解惑
        </button>
      </div>
    </div>
  )

  // ============= MAIN LANDING PAGE =============
  return (
    <div style={{ background: "rgb(1,3,20)", minHeight: "100vh", position: "relative" }}>
      {/* Body gradient background (Evervault's body background-image technique) */}
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: 1600,
        background: "radial-gradient(80% 60% at 50% 0%, rgba(180,140,40,.25) 0%, rgba(160,100,30,.08) 35%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Particles */}
      <ParticleBackground />

      {/* Flicker texture overlay */}
      <div className="flicker" />

      {/* ===== BANNER (Evervault: 50px, 13px, border-bottom) ===== */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 50, padding: "0 24px", fontSize: 13, fontWeight: 400,
        background: "rgb(1,3,20)", borderBottom: "1px solid rgba(255,255,255,.1)",
        position: "relative", zIndex: 2,
      }}>
        ✨ AI 六爻决策助手已上线 <a href="#" style={{ color: "#c9a44c", textDecoration: "none", fontWeight: 500, marginLeft: 2 }}>了解更多 →</a>
      </div>

      {/* ===== NAV (Evervault: 40px, transparent, sticky) ===== */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, height: 40,
        background: "transparent",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          height: 40, padding: "0 25.6px", maxWidth: 1440, margin: "0 auto",
        }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: 5, background: "#c9a44c",
              color: "#010314", fontSize: 12, fontWeight: 700,
            }}>爻</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>爻爻</span>
          </a>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", height: 40 }}>
            {["首页", "功能", "历史", "关于"].map((l, i) => (
              <button key={l} onClick={() => {
                if (i === 2) navigate("/history")
              }} style={{
                fontSize: 12, fontWeight: 500, color: "#fff",
                padding: "12px 0", margin: "0 12px",
                border: "none", background: "none", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "opacity .15s",
              }}>
                {l}
              </button>
            ))}
            <button onClick={() => { setQ(""); setOpen(true) }} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 12, fontWeight: 500, color: "rgb(42,43,58)",
              background: "rgba(255,255,255,.95)", padding: "0 16px", height: 40,
              borderRadius: 25, border: "none", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", marginLeft: 16, transition: "opacity .15s",
            }}>
              开始起卦 →
            </button>
          </div>
        </div>
      </nav>

      <main style={{ position: "relative", overflow: "clip visible" }}>
        {/* ===== HERO (Evervault: header, margin-top -76.8px, padding 0 25.6px) ===== */}
        <header style={{
          display: "block", padding: "0 25.6px", margin: "-76.8px 0 0",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 180 }}>
            {/* h1: 56px/600, line-height 56px, letter-spacing -0.84px, mb 8px */}
            <h1 style={{
              fontSize: 56, fontWeight: 600, lineHeight: "56px",
              color: "#fff", letterSpacing: "-0.84px", marginBottom: 8,
            }}>
              两难之间 · 以卦明辨
            </h1>

            {/* h2: 32px/500, line-height 40px, mb 24px */}
            <h2 style={{
              fontSize: 32, fontWeight: 500, lineHeight: "40px",
              color: "#fff", marginBottom: 24,
            }}>
              AI 六爻决策助手
            </h2>

            {/* p: 16px, line-height 28px, max-width 600px, mb 40px */}
            <p style={{
              fontSize: 16, color: "#fff", lineHeight: "28px",
              maxWidth: 600, marginBottom: 40,
            }}>
              传承千年六爻智慧，融合现代 AI 技术。铜钱、数字、时间三种方式即时起卦，深度解读每一个卦象背后的玄机，助你在两难之间明辨方向。
            </p>

            {/* Buttons: display grid (Evervault's layout) */}
            <div style={{
              display: "grid", gridTemplateColumns: "auto auto", gap: 12,
              justifyContent: "start",
            }}>
              <button onClick={() => { setQ(""); setOpen(true) }}
                className="btn-pulse"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500,
                  border: "none", cursor: "pointer", borderRadius: 25,
                  padding: "0 16px", height: 40,
                  color: "rgb(42,43,58)", background: "rgba(255,255,255,.95)",
                  transition: "opacity .2s",
                }}>
                开始起卦
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M5 12h13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
              <button onClick={() => navigate("/history")} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 500,
                border: "none", cursor: "pointer", borderRadius: 25,
                padding: "0 16px", height: 40,
                color: "#fff", background: "transparent",
                transition: "opacity .2s",
              }}>
                查看历史
              </button>
            </div>
          </div>
        </header>

        {/* ===== HEXAGRAM CARDS WITH VERTICAL LINE REVEAL ===== */}
        <div style={{ paddingTop: 128 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 25.6px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: 20,
            }}>
              {/* Row 1: Reveal cards (卦象 → hover shows 加密) */}
              {hexagrams.map((h, i) => (
                <div key={`d${i}`} className="reveal-card"
                  style={{
                    position: "relative", overflow: "hidden", borderRadius: 10, cursor: "pointer",
                    boxShadow: "rgba(255,255,255,.18) 0 1px 0 0 inset, rgba(0,0,0,.1) 0 -1px 16px 0 inset, rgba(0,0,0,.06) 0 0 10px 0 inset, rgba(0,0,0,.15) 0 0 0 1px, rgba(0,0,0,.15) 0 1px 2px 0",
                    transition: "box-shadow .4s", minHeight: 75,
                  }}>
                  {/* Decrypt layer (bottom) */}
                  <div style={{
                    position: "relative", zIndex: 1, height: "100%",
                    background: "linear-gradient(155.85deg, rgba(180,120,40,.9) -3.09%, rgba(220,180,100,.85) 94.41%)",
                    padding: "12px 14px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "'SF Mono', Menlo, Consolas, monospace", color: "#fff",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ width: 24, height: 18, borderRadius: 3, background: "rgba(255,255,255,.2)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 5, top: 3, width: 12, height: 10, borderRadius: 2, background: "rgba(255,255,255,.1)" }} />
                      </div>
                      <div style={{ display: "flex", gap: 1, opacity: .45 }}><span style={{ fontSize: 18 }}>{h.symbol}</span></div>
                    </div>
                    <div style={{ fontSize: 13, letterSpacing: ".03em", color: "rgba(255,255,255,.92)", marginBottom: 2 }}>{h.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
                      <div><div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: ".05em", opacity: .45 }}>卦辞</div><div style={{ fontSize: 9, letterSpacing: ".02em", opacity: .75 }}>{h.desc}</div></div>
                      <div><div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: ".05em", opacity: .45 }}>爻象</div><div style={{ fontSize: 9, letterSpacing: ".02em", opacity: .75 }}>{h.lines}</div></div>
                    </div>
                  </div>
                  {/* Encrypt layer (top, sweeps in on hover) */}
                  <div className="card-encrypt-layer" style={{
                    position: "absolute", inset: 0, zIndex: 3,
                    background: "rgba(15,8,30,.96)", border: "1px solid rgba(255,255,255,.06)",
                    padding: "12px 14px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "'SF Mono', Menlo, Consolas, monospace", color: "rgba(255,255,255,.6)",
                    clipPath: "inset(0 100% 0 0)", transition: "clip-path .25s ease-out",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, opacity: .5 }}>
                      <div style={{ width: 24, height: 18, borderRadius: 3, background: "rgba(255,255,255,.06)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 5, top: 3, width: 12, height: 10, borderRadius: 2, background: "rgba(255,255,255,.03)" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 7, opacity: .35, fontFamily: "'Inter', sans-serif" }}>🔒 加密</div>
                    </div>
                    <div style={{ fontSize: 7, letterSpacing: ".01em", lineHeight: 1.2, wordBreak: "break-all", flex: 1, overflow: "hidden", color: "rgba(255,255,255,.5)" }}>
                      {encryptData[i]}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
                      <div><div style={{ fontSize: 6, textTransform: "uppercase", letterSpacing: ".05em", opacity: .2 }}>数据加密中</div><div style={{ fontSize: 7, letterSpacing: ".02em", opacity: .25 }}>**** ****</div></div>
                    </div>
                  </div>
                  {/* Vertical divider line */}
                  <div className="card-divider-line" style={{
                    position: "absolute", top: 0, bottom: 0, zIndex: 4,
                    left: 0, width: 2,
                    background: "rgba(255,255,255,.75)",
                    boxShadow: "0 0 10px rgba(255,255,255,.25), 0 0 2px rgba(255,255,255,.4)",
                    transition: "left .25s ease-out", pointerEvents: "none",
                    transform: "translateX(-1px)",
                  }} />
                </div>
              ))}

              {/* Row 2: More reveal cards */}
              {hexagrams.map((h, i) => {
                const j = (i + 3) % 6;
                return (
                <div key={`e${i}`} className="reveal-card"
                  style={{
                    position: "relative", overflow: "hidden", borderRadius: 10, cursor: "pointer",
                    boxShadow: "rgba(255,255,255,.18) 0 1px 0 0 inset, rgba(0,0,0,.1) 0 -1px 16px 0 inset, rgba(0,0,0,.06) 0 0 10px 0 inset, rgba(0,0,0,.15) 0 0 0 1px, rgba(0,0,0,.15) 0 1px 2px 0",
                    transition: "box-shadow .4s", minHeight: 75,
                  }}>
                  <div style={{
                    position: "relative", zIndex: 1, height: "100%",
                    background: "linear-gradient(155.85deg, rgba(180,120,40,.9) -3.09%, rgba(220,180,100,.85) 94.41%)",
                    padding: "12px 14px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "'SF Mono', Menlo, Consolas, monospace", color: "#fff",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ width: 24, height: 18, borderRadius: 3, background: "rgba(255,255,255,.2)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 5, top: 3, width: 12, height: 10, borderRadius: 2, background: "rgba(255,255,255,.1)" }} />
                      </div>
                      <div style={{ display: "flex", gap: 1, opacity: .45 }}><span style={{ fontSize: 18 }}>{hexagrams[j].symbol}</span></div>
                    </div>
                    <div style={{ fontSize: 13, letterSpacing: ".03em", color: "rgba(255,255,255,.92)", marginBottom: 2 }}>{hexagrams[j].name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
                      <div><div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: ".05em", opacity: .45 }}>卦辞</div><div style={{ fontSize: 9, letterSpacing: ".02em", opacity: .75 }}>{hexagrams[j].desc}</div></div>
                      <div><div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: ".05em", opacity: .45 }}>爻象</div><div style={{ fontSize: 9, letterSpacing: ".02em", opacity: .75 }}>{hexagrams[j].lines}</div></div>
                    </div>
                  </div>
                  <div className="card-encrypt-layer" style={{
                    position: "absolute", inset: 0, zIndex: 3,
                    background: "rgba(15,8,30,.96)", border: "1px solid rgba(255,255,255,.06)",
                    padding: "12px 14px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: "'SF Mono', Menlo, Consolas, monospace", color: "rgba(255,255,255,.6)",
                    clipPath: "inset(0 100% 0 0)", transition: "clip-path .25s ease-out",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, opacity: .5 }}>
                      <div style={{ width: 24, height: 18, borderRadius: 3, background: "rgba(255,255,255,.06)" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 7, opacity: .35, fontFamily: "'Inter', sans-serif" }}>🔒 加密</div>
                    </div>
                    <div style={{ fontSize: 7, letterSpacing: ".01em", lineHeight: 1.2, wordBreak: "break-all", flex: 1, overflow: "hidden", color: "rgba(255,255,255,.5)" }}>
                      {encryptData[(i + 2) % 6]}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
                      <div><div style={{ fontSize: 6, textTransform: "uppercase", letterSpacing: ".05em", opacity: .2 }}>数据加密中</div><div style={{ fontSize: 7, letterSpacing: ".02em", opacity: .25 }}>**** ****</div></div>
                    </div>
                  </div>
                  <div className="card-divider-line" style={{
                    position: "absolute", top: 0, bottom: 0, zIndex: 4,
                    left: 0, width: 2,
                    background: "rgba(255,255,255,.75)",
                    boxShadow: "0 0 10px rgba(255,255,255,.25), 0 0 2px rgba(255,255,255,.4)",
                    transition: "left .25s ease-out", pointerEvents: "none",
                    transform: "translateX(-1px)",
                  }} />
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* ===== LOGOS / TRUST SECTION ===== */}
        <section className="reveal" style={{
          padding: "80px 32px", textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,.04)",
          borderBottom: "1px solid rgba(255,255,255,.04)",
          marginTop: 80,
        }}>
          <p style={{
            fontSize: 13, fontWeight: 500, color: "rgba(223,225,244,.35)",
            letterSpacing: ".05em", marginBottom: 32, textTransform: "uppercase",
          }}>
            传统智慧 · 现代科技
          </p>
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            alignItems: "center", gap: 40, maxWidth: 1000, margin: "0 auto",
          }}>
            {["周易", "六爻", "铜钱", "八卦", "AI", "爻辞", "卦象", "纳甲"].map(w => (
              <span key={w} style={{ fontSize: 18, fontWeight: 600, color: "rgba(223,225,244,.25)" }}>{w}</span>
            ))}
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="reveal" style={{ padding: "128px 0 160px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h3 style={{
              fontSize: 14, fontWeight: 600, color: "#c9a44c",
              letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16,
            }}>
              功能
            </h3>
            <h2 style={{
              fontSize: 40, fontWeight: 600, color: "#fff", lineHeight: 1.2,
              maxWidth: 700, margin: "0 auto",
            }}>
              传承六爻智慧，融合 AI 技术
            </h2>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1,
            background: "rgba(255,255,255,.04)", borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(255,255,255,.06)",
            margin: "0 25.6px",
          }}>
            {features.map((f, i) => (
              <div key={i}
                className="feat-card-interactive"
                style={{
                  background: "rgba(255,255,255,.015)", padding: "40px 32px",
                  transition: "background .15s", cursor: "pointer",
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "rgba(200,160,60,.12)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 20, fontSize: 18,
                }}>{f.icon}</div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{f.title}</h4>
                <p style={{ fontSize: 14, color: "rgba(223,225,244,.55)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer>
        <div style={{ padding: "80px 32px 40px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, borderRadius: 5, background: "#c9a44c",
                  color: "#010314", fontSize: 12, fontWeight: 700,
                }}>爻</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>爻爻</span>
              </div>
              <p style={{ color: "rgba(223,225,244,.4)", fontSize: 14, lineHeight: 1.6 }}>
                AI 六爻决策助手 — 传承千年智慧，融合现代科技。
              </p>
            </div>
            <div style={{ display: "flex", gap: 80, flexWrap: "wrap" }}>
              <div>
                <h5 style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>功能</h5>
                {["铜钱起卦", "数字起卦", "AI 解卦"].map(l => (
                  <div key={l} style={{ fontSize: 13, color: "rgba(223,225,244,.45)", marginBottom: 8, cursor: "pointer" }}>{l}</div>
                ))}
              </div>
              <div>
                <h5 style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>关于</h5>
                {["关于爻爻", "使用指南", "反馈"].map(l => (
                  <div key={l} style={{ fontSize: 13, color: "rgba(223,225,244,.45)", marginBottom: 8, cursor: "pointer" }}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.04)",
          padding: "24px 0", display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, fontSize: 12, color: "rgba(223,225,244,.3)",
          maxWidth: 1200, margin: "0 auto",
        }}>
          <span>© 2024 爻爻.</span>
          <span>隐私 · 条款</span>
        </div>
      </footer>

      {/* ===== DYNAMIC EFFECTS CSS ===== */}
      <style>{`
        /* Multi-ring pulse (Evervault: 3DiVKG__pulse) */
        @keyframes ringExpand {
          0% { inset: -4px; opacity: .6; border-width: 1.5px; }
          100% { inset: -24px; opacity: 0; border-width: .5px; }
        }
        @keyframes btnPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,.25); }
          70% { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }

        /* Shimmer */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Scroll reveal */
        .reveal {
          opacity: 0; transform: translateY(24px);
          transition: opacity .7s ease, transform .7s ease;
        }
        .reveal.reveal-visible {
          opacity: 1; transform: translateY(0);
        }

        /* Card hover tilt */
        .tilt-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: rgba(255,255,255,.25) 0 1px 0 0 inset,
                      rgba(0,0,0,.12) 0 -1px 20px 0 inset,
                      rgba(0,0,0,.08) 0 0 14px 0 inset,
                      rgba(0,0,0,.2) 0 0 0 1px,
                      rgba(0,0,0,.25) 0 4px 12px 0,
                      rgba(255,255,255,.04) 0 0 0 2px !important;
        }

        /* Vertical line card reveal on hover */
        .reveal-card:hover .card-encrypt-layer {
          clip-path: inset(0 0 0 0) !important;
        }
        .reveal-card:hover .card-divider-line {
          left: 100% !important;
        }
        .reveal-card:hover {
          box-shadow: rgba(255,255,255,.25) 0 1px 0 0 inset,
                      rgba(0,0,0,.12) 0 -1px 22px 0 inset,
                      rgba(0,0,0,.08) 0 0 16px 0 inset,
                      rgba(0,0,0,.2) 0 0 0 1px,
                      rgba(0,0,0,.3) 0 4px 14px 0,
                      rgba(255,255,255,.06) 0 0 0 2px !important;
        }

        .feat-card-interactive:hover { background: rgba(255,255,255,.04) !important; }
        @media (max-width: 900px) {
          h1 { font-size: 36px !important; line-height: 40px !important; }
          h2 { font-size: 22px !important; line-height: 28px !important; }
        }
      `}</style>
    </div>
  )
}
