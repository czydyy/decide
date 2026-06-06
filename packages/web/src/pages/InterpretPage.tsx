import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "@/providers/ThemeProvider"
import { historyApi } from "@/lib/api"
import { yaoSymbol, formatDate } from "@liuyao/shared"
import type { HistoryDetail } from "@liuyao/shared"
import Badge from "@/components/ui/Badge"

export default function InterpretPage() {
  const { recordId } = useParams<{ recordId: string }>()
  const navigate = useNavigate()
  const { setMode } = useTheme()
  const [record, setRecord] = useState<HistoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode("clean")
    return () => setMode("clean")
  }, [setMode])

  useEffect(() => {
    if (!recordId) {
      setError("缺少记录 ID")
      setLoading(false)
      return
    }
    historyApi
      .get(recordId)
      .then(setRecord)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [recordId])

  if (loading) {
    return (
      <div className="min-h-screen bg-clean-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-clean-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-sec mb-4">{error ?? "记录不存在"}</p>
          <button onClick={() => navigate(-1)} className="text-gold-text">← 返回</button>
        </div>
      </div>
    )
  }

  const paipan = record.paipan_result
  const benGua = paipan && typeof paipan === "object" && "ben_gua" in paipan
    ? (paipan as Record<string, unknown>).ben_gua as Record<string, unknown> | undefined
    : undefined

  return (
    <div className="min-h-screen bg-clean-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-clean-bg/90 backdrop-blur border-b border-clean-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-ink-sec hover:text-ink">
            <span className="text-lg">☯</span>
            <span className="font-semibold">爻爻</span>
          </button>
          <span className="text-ink-dim">/</span>
          <button onClick={() => navigate(-1)} className="text-ink-dim hover:text-ink">返回</button>
        </div>
      </nav>

      <div className="max-w-[680px] mx-auto px-6 py-8 space-y-6">
        {/* Meta */}
        <div className="bg-white border border-clean-border rounded-lg p-6">
          {record.question && (
            <h2 className="text-lg font-semibold text-ink mb-3">{record.question}</h2>
          )}
          <div className="flex items-center gap-2 flex-wrap text-sm text-ink-sec">
            <Badge>{record.method}</Badge>
            {benGua && (
              <span>
                {benGua.symbol as string} {benGua.name as string}
              </span>
            )}
            <span className="text-ink-dim">{formatDate(record.created_at)}</span>
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="bg-white border border-clean-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-ink-dim uppercase tracking-wider mb-4">
            AI 解读
          </h3>
          {record.ai_interpretation ? (
            <div className="prose prose-sm max-w-none text-ink-sec leading-relaxed">
              {record.ai_interpretation.split("\n").map((line, i) => {
                if (line.startsWith("【") && line.includes("】")) {
                  return (
                    <h4 key={i} className="text-gold-text font-semibold mt-5 mb-2 text-base">
                      {line}
                    </h4>
                  )
                }
                return (
                  <p key={i} className="mb-1 text-sm">
                    {line}
                  </p>
                )
              })}
            </div>
          ) : (
            <p className="text-ink-dim text-sm">暂无 AI 解读内容</p>
          )}
        </div>
      </div>
    </div>
  )
}
