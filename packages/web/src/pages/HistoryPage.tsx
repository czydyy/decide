import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/providers/ThemeProvider"
import { historyApi } from "@/lib/api"
import { formatDate, formatDongYao } from "@liuyao/shared"
import type { HistoryItem } from "@liuyao/shared"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"

const METHOD_BADGES: Record<string, string> = {
  yao: "铜钱起卦",
  number: "数字起卦",
  time: "时间起卦",
  manual: "手动排盘",
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { setMode } = useTheme()
  const [records, setRecords] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMode("clean")
    return () => setMode("clean")
  }, [setMode])

  useEffect(() => {
    historyApi
      .list(1, 50)
      .then(setRecords)
      .catch(() => {
        // Fallback — show empty
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条记录？")) return
    try {
      await historyApi.delete(id)
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // ignore
    }
  }

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
          <span className="text-ink font-medium">历史记录</span>
        </div>
      </nav>

      <div className="max-w-[680px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-ink">历史记录</h1>
        <p className="text-sm text-ink-sec mt-1">过往占卜，随时回顾</p>

        {loading ? (
          <div className="mt-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : records.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-4xl mb-3">📜</p>
            <p className="text-ink-sec">还没有占卜记录</p>
            <p className="text-sm text-ink-dim mt-1">去首页开始第一次占卜吧</p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              前往首页
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {records.map((r) => (
              <Card
                key={r.id}
                className="cursor-pointer hover:shadow-popup transition-shadow group"
                onClick={() => navigate(`/interpret/${r.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Hexagram icon */}
                  <div className="w-12 h-12 bg-gold-soft rounded-md flex items-center justify-center text-xl shrink-0">
                    ☰
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ink">{r.ben_gua_name}</span>
                      <Badge>{METHOD_BADGES[r.method] ?? r.method}</Badge>
                      <span className="text-xs text-ink-dim">{formatDate(r.created_at)}</span>
                    </div>
                    {r.question && (
                      <p className="mt-1 text-sm text-ink-sec truncate">{r.question}</p>
                    )}
                    {r.dong_yao?.length > 0 && (
                      <p className="mt-1 text-xs text-ink-dim">{formatDongYao(r.dong_yao)}</p>
                    )}
                    {r.ai_interpretation && (
                      <p className="mt-2 text-xs text-ink-dim line-clamp-2">
                        {r.ai_interpretation.slice(0, 200)}
                      </p>
                    )}
                  </div>
                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(r.id)
                    }}
                    className="text-xs text-ink-dim hover:text-accent opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    删除
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
