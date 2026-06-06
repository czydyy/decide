import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTheme } from "@/providers/ThemeProvider"
import { conversationApi } from "@/lib/api"
import type { PaipanData, PaipanSummary } from "@liuyao/shared"
import Button from "@/components/ui/Button"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setMode } = useTheme()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [convId, setConvId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paipan, setPaipan] = useState<PaipanSummary | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const msgIdRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMode("clean")
    return () => {
      setMode("clean")
      abortRef.current?.abort()
    }
  }, [setMode])

  useEffect(() => {
    const dataStr = searchParams.get("data")
    const question = searchParams.get("question") ?? "占卜"
    if (!dataStr) {
      navigate("/", { replace: true })
      return
    }

    let paipanData: PaipanData
    try {
      paipanData = JSON.parse(decodeURIComponent(dataStr))
    } catch {
      navigate("/", { replace: true })
      return
    }

    const init = async () => {
      try {
        const res = await conversationApi.create({
          question,
          method: "manual",
          hexagram_index: paipanData.ben_gua.index ?? 1,
          dong_yao: paipanData.dong_yao,
          day_gan: "甲",
          month_zhi: "子",
          day_zhi: "午",
        })

        setConvId(res.conversation_id)
        setPaipan(res.paipan)

        // Add initial user message
        msgIdRef.current++
        setMessages([{ id: `msg-${msgIdRef.current}`, role: "user", content: question }])

        // Start streaming the assistant reply
        setStreaming(true)
        let fullText = ""
        abortRef.current = conversationApi.streamMessage(
          res.conversation_id,
          { content: question },
          (chunk) => {
            fullText += chunk
            setStreamingText(fullText)
          },
          () => {
            msgIdRef.current++
            setMessages((prev) => [
              ...prev,
              { id: `msg-${msgIdRef.current}`, role: "assistant", content: fullText },
            ])
            setStreamingText("")
            setStreaming(false)
          },
          (err) => {
            setStreaming(false)
          }
        )
      } catch (err) {
        // fall through
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [searchParams, navigate])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, streamingText])

  const sendMessage = () => {
    if (!inputValue.trim() || !convId || streaming) return

    const content = inputValue.trim()
    setInputValue("")

    msgIdRef.current++
    setMessages((prev) => [...prev, { id: `msg-${msgIdRef.current}`, role: "user", content }])

    setStreaming(true)
    let fullText = ""
    abortRef.current = conversationApi.streamMessage(
      convId,
      { content },
      (chunk) => {
        fullText += chunk
        setStreamingText(fullText)
      },
      () => {
        msgIdRef.current++
        setMessages((prev) => [
          ...prev,
          { id: `msg-${msgIdRef.current}`, role: "assistant", content: fullText },
        ])
        setStreamingText("")
        setStreaming(false)
      },
      () => setStreaming(false)
    )
  }

  const formatContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("【") && line.endsWith("】")) {
          return (
            <h3 key={i} className="text-gold font-semibold mt-4 mb-2 first:mt-0">
              {line}
            </h3>
          )
        }
        // Bold markers
        const withBold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        return (
          <p key={i} className="text-sm leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: withBold }} />
        )
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-clean-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-ink-sec">正在推演卦象...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-clean-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-clean-bg/90 backdrop-blur border-b border-clean-border px-4 py-3">
        <div className="max-w-[680px] mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-ink-sec hover:text-ink">
            ← 返回
          </button>
          <div>
            <h1 className="font-semibold text-ink">AI 解读</h1>
            {paipan && (
              <p className="text-xs text-ink-dim">
                {paipan.ben_gua.symbol} {paipan.ben_gua.name}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-[680px] mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#f0e6d2] text-ink"
                    : "bg-white border border-clean-border shadow-sm text-ink"
                }`}
              >
                {formatContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Streaming indicator */}
          {streaming && streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-white border border-clean-border shadow-sm">
                {formatContent(streamingText)}
                <span className="inline-block w-1.5 h-4 bg-gold animate-pulse ml-0.5 align-middle" />
              </div>
            </div>
          )}
          {streaming && !streamingText && (
            <div className="flex justify-start">
              <div className="px-5 py-3 rounded-2xl bg-white border border-clean-border">
                <span className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gold/60 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gold/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-gold/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-clean-bg border-t border-clean-border px-4 py-3">
        <div className="max-w-[680px] mx-auto flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3 bg-white border border-clean-border rounded-full text-ink placeholder-ink-dim focus:outline-none focus:border-gold"
            placeholder="追问更多细节..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || streaming}
            className="w-10 h-10 flex items-center justify-center bg-accent text-white rounded-full disabled:opacity-30 hover:bg-accent-hover transition-all shrink-0"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
