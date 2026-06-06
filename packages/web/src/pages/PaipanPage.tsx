import { useState, useEffect, Suspense, lazy } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTheme } from "@/providers/ThemeProvider"
import { qiguaApi } from "@/lib/api"
import { yaoSymbol } from "@liuyao/shared"
import type { PaipanData } from "@liuyao/shared"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"

const HexagramRing = lazy(() => import("@/components/three/HexagramRing"))

export default function PaipanPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setMode } = useTheme()
  const [data, setData] = useState<PaipanData | null>(null)
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode("warm")
    return () => setMode("clean")
  }, [setMode])

  useEffect(() => {
    const method = searchParams.get("method") as "yao" | "number" | "time" | null
    const q = searchParams.get("question") ?? ""
    setQuestion(q)

    if (!method) {
      setError("缺少起卦方式")
      setLoading(false)
      return
    }

    qiguaApi
      .fullPaipan({ method, day_gan: "甲" })
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-white/70">正在起卦...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">起卦失败</p>
          <p className="text-white/60">{error}</p>
          <Button className="mt-4" onClick={() => navigate("/")}>返回首页</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-warm">
      {/* Nav */}
      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white">
          ← 返回
        </button>
        <span className="text-white font-semibold">卦象结果</span>
      </nav>

      <div className="max-w-[680px] mx-auto px-6 pb-20 space-y-6">
        {/* Question */}
        {question && (
          <Card variant="dark" padding="md">
            <p className="text-sm text-white/50">你所问</p>
            <p className="mt-1 text-white text-lg">{question}</p>
          </Card>
        )}

        {/* Gua Hero */}
        <Card variant="dark" padding="lg">
          <div className="text-center">
            <p className="text-5xl mb-3">{data.ben_gua.symbol}</p>
            <h2 className="text-2xl font-bold text-white">{data.ben_gua.name}</h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge>{data.palace}宫</Badge>
              <Badge variant="gold">{data.palace_element}</Badge>
            </div>
            {data.ben_gua.gua_ci && (
              <p className="mt-4 text-sm text-white/60 italic leading-relaxed max-w-[400px] mx-auto">
                「{data.ben_gua.gua_ci}」
              </p>
            )}
          </div>
        </Card>

        {/* 3D Hexagram Ring */}
        <Suspense fallback={<div className="h-[350px] md:h-[450px]" />}>
          <Card variant="dark" padding="sm" className="overflow-hidden">
            <HexagramRing lines={data.lines} />
          </Card>
        </Suspense>

        {/* Yao Table */}
        <Card variant="dark">
          <h3 className="text-sm font-semibold text-white/70 mb-4">六爻详情</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/80">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="py-2 px-2 text-left w-10">位</th>
                  <th className="py-2 px-2 text-left">爻</th>
                  <th className="py-2 px-2 text-left">纳甲</th>
                  <th className="py-2 px-2 text-left">六亲</th>
                  <th className="py-2 px-2 text-left">六兽</th>
                  <th className="py-2 px-2 text-left">世应</th>
                </tr>
              </thead>
              <tbody>
                {[...data.lines].reverse().map((line) => (
                  <tr key={line.position} className="border-b border-white/5">
                    <td className="py-3 px-2">{line.position}</td>
                    <td className="py-3 px-2 font-mono text-lg">
                      {yaoSymbol(line.yao_type, line.changing)}
                      {line.changing && <span className="text-gold text-xs ml-1">○</span>}
                    </td>
                    <td className="py-3 px-2">{line.najia}</td>
                    <td className="py-3 px-2">{line.liuqin}</td>
                    <td className="py-3 px-2">{line.liushou}</td>
                    <td className="py-3 px-2">
                      {line.shiying && (
                        <span className={line.shiying === "世" ? "text-gold" : "text-blue-300"}>
                          {line.shiying}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Transform Grid */}
        {(data.bian_gua || data.hu_gua || data.zong_gua) && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "变卦", gua: data.bian_gua },
              { label: "互卦", gua: data.hu_gua },
              { label: "综卦", gua: data.zong_gua },
            ].map(
              ({ label, gua }) =>
                gua && (
                  <Card key={label} variant="dark" padding="sm">
                    <p className="text-xs text-white/40 mb-1">{label}</p>
                    <p className="text-lg">{gua.symbol}</p>
                    <p className="text-xs text-white/70">{gua.name}</p>
                  </Card>
                )
            )}
          </div>
        )}

        {/* CTA */}
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            const encoded = encodeURIComponent(JSON.stringify(data))
            navigate(`/chat?data=${encoded}&question=${encodeURIComponent(question)}`)
          }}
        >
          查看 AI 解读 →
        </Button>
      </div>
    </div>
  )
}
