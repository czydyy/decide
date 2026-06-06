import { useState, useEffect, useRef } from "react"
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { conversationApi } from "@/lib/api"
import type { PaipanData, PaipanSummary } from "@liuyao/shared"

interface Props {
  navigation: NativeStackNavigationProp<any>
  route: RouteProp<any>
}

interface Msg {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatScreen({ navigation, route }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [inputValue, setInputValue] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [convId, setConvId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paipan, setPaipan] = useState<PaipanSummary | null>(null)
  const scrollRef = useRef<ScrollView>(null)
  const msgIdRef = useRef(0)

  const params = route.params as any
  const question = params?.question ?? "占卜"

  useEffect(() => {
    if (!params?.data) return
    let paipanData: PaipanData
    try {
      paipanData = JSON.parse(params.data)
    } catch { return }

    const init = async () => {
      try {
        const res = await conversationApi.create({
          question,
          method: "manual",
          hexagram_index: paipanData.ben_gua.index ?? 1,
          dong_yao: paipanData.dong_yao,
        })
        setConvId(res.conversation_id)
        setPaipan(res.paipan)

        msgIdRef.current++
        setMessages([{ id: `m-${msgIdRef.current}`, role: "user", content: question }])

        setStreaming(true)
        let full = ""
        conversationApi.streamMessage(
          res.conversation_id,
          { content: question },
          (chunk) => {
            full += chunk
            setStreamingText(full)
          },
          () => {
            msgIdRef.current++
            setMessages((p) => [...p, { id: `m-${msgIdRef.current}`, role: "assistant", content: full }])
            setStreamingText("")
            setStreaming(false)
          },
          () => setStreaming(false)
        )
      } catch { /* ignore */ }
      setLoading(false)
    }
    init()
  }, [])

  const send = () => {
    if (!inputValue.trim() || !convId || streaming) return
    const content = inputValue.trim()
    setInputValue("")

    msgIdRef.current++
    setMessages((p) => [...p, { id: `m-${msgIdRef.current}`, role: "user", content }])

    setStreaming(true)
    let full = ""
    conversationApi.streamMessage(
      convId,
      { content },
      (chunk) => {
        full += chunk
        setStreamingText(full)
      },
      () => {
        msgIdRef.current++
        setMessages((p) => [...p, { id: `m-${msgIdRef.current}`, role: "assistant", content: full }])
        setStreamingText("")
        setStreaming(false)
      },
      () => setStreaming(false)
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>正在推演卦象...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 解读</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.msgList}
        contentContainerStyle={styles.msgContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleAI]}
          >
            <Text style={[styles.bubbleText, m.role === "user" && { color: "#1a1410" }]}>
              {m.content}
            </Text>
          </View>
        ))}
        {streaming && streamingText ? (
          <View style={styles.bubbleAI}>
            <Text style={styles.bubbleText}>{streamingText}</Text>
          </View>
        ) : null}
        {streaming && !streamingText ? (
          <View style={styles.bubbleAI}>
            <Text style={styles.bubbleText}>...</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="追问更多细节..."
          placeholderTextColor="#a09888"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={send}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputValue.trim() && { opacity: 0.3 }]}
          onPress={send}
          disabled={!inputValue.trim()}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#faf8f3" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#6b6058", fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ebe5d8",
    backgroundColor: "#faf8f3",
    gap: 12,
  },
  backBtn: { color: "#6b6058", fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#1a1410" },
  msgList: { flex: 1 },
  msgContent: { padding: 16, gap: 12 },
  bubble: { maxWidth: "85%", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 18 },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: "#f0e6d2" },
  bubbleAI: { alignSelf: "flex-start", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ebe5d8" },
  bubbleText: { fontSize: 15, color: "#1a1410", lineHeight: 22 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ebe5d8",
    backgroundColor: "#faf8f3",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ebe5d8",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1410",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ec5930",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
})
