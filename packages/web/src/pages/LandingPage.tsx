import { useState, Suspense, lazy } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/providers/ThemeProvider"
import { useAuthContext } from "@/providers/AuthProvider"
import { QUICK_QUESTIONS, METHOD_LABELS } from "@liuyao/shared"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"

const CoinTossAnimation = lazy(() => import("@/components/three/CoinTossAnimation"))
const TaijiSphere = lazy(() => import("@/components/three/TaijiSphere"))

const FEATURES = [
  { icon: "☯", title: "六爻正统", desc: "基于传统纳甲筮法，京房八宫卦体系，保证卦象推演的准确性" },
  { icon: "🤖", title: "AI 深度解读", desc: "结合大语言模型，从卦辞、爻辞、世应、六亲多维度解析" },
  { icon: "🔮", title: "即时起卦", desc: "支持铜钱、数字、时间三种起卦方式，随时随地寻求指引" },
]

const METHODS = [
  { key: "yao" as const, icon: "🪙", label: "铜钱起卦", desc: "传统六爻，掷钱成卦" },
  { key: "number" as const, icon: "🔢", label: "数字起卦", desc: "随心取数，以数推象" },
  { key: "time" as const, icon: "🕐", label: "时间起卦", desc: "即刻推演，应时而动" },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { setMode } = useTheme()
  const { isLoggedIn } = useAuthContext()
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState("")
  const [method, setMethod] = useState<"yao" | "number" | "time">("yao")

  // Set warm mode on mount, restore on unmount
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useState(() => {
    setMode("warm")
    return () => setMode("clean")
  })

  const handleStart = () => {
    if (!question.trim()) return
    const params = new URLSearchParams({ method, question: question.trim() })
    navigate(`/paipan?${params.toString()}`)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen gradient-warm">
      {/* ============ NAV ============ */}
      <nav className="relative z-20 max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white"
        >
          <span className="text-2xl">☯</span>
          <span className="text-xl font-extrabold tracking-[0.1em]">爻爻</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <button onClick={() => navigate("/history")} className="hover:text-white transition-colors">
            历史记录
          </button>
          <button
            onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}
            className="hover:text-white transition-colors"
          >
            {isLoggedIn ? "我的" : "登录"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-20 mx-4 mb-4 p-4 bg-[rgba(20,16,12,0.9)] backdrop-blur-lg rounded-lg border border-white/10">
          <button
            onClick={() => { navigate("/history"); setMobileMenuOpen(false) }}
            className="block w-full py-3 text-center text-white/80 hover:text-white border-b border-white/5"
          >
            历史记录
          </button>
          <button
            onClick={() => { navigate(isLoggedIn ? "/profile" : "/login"); setMobileMenuOpen(false) }}
            className="block w-full py-3 text-center text-white/80 hover:text-white"
          >
            {isLoggedIn ? "我的" : "登录"}
          </button>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section className="relative z-10 max-w-[680px] mx-auto px-6 pt-16 pb-20 text-center">
        {/* 3D Background Sphere */}
        <TaijiSphere className="hidden md:block opacity-60" />

        <Badge variant="gold">AI × 周易</Badge>

        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-[0.02em]">
          两难之间，
          <span className="text-[#f6bc4f]">以卦明辨</span>
        </h1>

        <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-[480px] mx-auto">
          传承千年六爻智慧，融合现代 AI 技术，为你解读每一个卦象背后的深意
        </p>

        {/* 3D Coin Animation */}
        <Suspense fallback={<div className="h-[320px] md:h-[400px]" />}>
          <CoinTossAnimation />
        </Suspense>

        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => setShowForm(true)}>
            <span className="text-xl">☯</span>
            开始起卦
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/history")}>
            查看历史
          </Button>
        </div>

        {/* Quick chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuestion(q)
                setShowForm(true)
              }}
              className="px-3 py-1.5 text-xs text-white/80 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:text-white transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative z-10 bg-clean-bg">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <p className="text-xs text-ink-dim uppercase tracking-[0.2em] text-center">
            核心能力
          </p>
          <h2 className="mt-3 text-3xl font-bold text-ink text-center">
            为什么选择爻爻
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-8 bg-white border border-clean-border rounded-lg text-center hover:shadow-popup transition-shadow duration-300"
              >
                <div className="w-14 h-14 mx-auto bg-gold-soft rounded-full flex items-center justify-center text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-sec leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ METHODS ============ */}
      <section className="relative z-10 bg-[#f5f2ea]">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <p className="text-xs text-ink-dim uppercase tracking-[0.2em] text-center">
            起卦方式
          </p>
          <h2 className="mt-3 text-3xl font-bold text-ink text-center">
            选择适合你的方式
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {METHODS.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMethod(m.key)
                  setShowForm(true)
                }}
                className="group p-8 bg-white border border-clean-border rounded-lg text-left hover:shadow-popup hover:border-gold/40 transition-all duration-300"
              >
                <span className="text-4xl">{m.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{m.label}</h3>
                <p className="mt-1 text-sm text-ink-sec">{m.desc}</p>
                <span className="inline-block mt-4 text-sm text-gold-text opacity-0 group-hover:opacity-100 transition-opacity">
                  开始 →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#1a1410] text-white/50">
        <div className="max-w-[1200px] mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">☯</span>
            <span className="text-xl font-bold text-white">爻爻</span>
          </div>
          <p className="text-sm">以千年智慧，解今日困惑</p>
          <p className="mt-2 text-xs">© 2024 爻爻 · 六爻决策助手</p>
        </div>
      </footer>

      {/* ============ FORM OVERLAY ============ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[rgba(26,20,16,0.95)] backdrop-blur-xl border border-white/10 rounded-t-2xl md:rounded-2xl p-8 animate-slide-up">
            {/* Close button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white text-xl transition-colors"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-white">起卦解惑</h2>
            <p className="mt-1 text-sm text-white/50">静心凝神，将你的困惑娓娓道来</p>

            {/* Question input */}
            <div className="mt-6">
              <label className="block text-sm text-white/70 mb-2">你的困惑</label>
              <textarea
                className="w-full h-28 bg-white/5 border border-white/10 rounded-md p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="写下你正在纠结的事情……"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                maxLength={200}
              />
              <p className="text-right text-xs text-white/30 mt-1">{question.length}/200</p>
            </div>

            {/* Method tabs */}
            <div className="mt-4">
              <label className="block text-sm text-white/70 mb-2">起卦方式</label>
              <div className="flex gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMethod(m.key)}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                      method === m.key
                        ? "bg-gold text-ink"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleStart}
              disabled={!question.trim()}
              className="mt-6 w-full py-3.5 bg-accent text-white font-semibold rounded-full hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed shadow-cta transition-all"
            >
              起卦解惑
            </button>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
