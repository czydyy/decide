import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { QUICK_QUESTIONS } from "@liuyao/shared"
import { qiguaApi } from "@/lib/api"

const METHODS = [
  { key: "yao" as const, icon: "🪙", label: "铜钱起卦", desc: "传统六爻，掷钱成卦" },
  { key: "number" as const, icon: "🔢", label: "数字起卦", desc: "随心取数，以数推象" },
  { key: "time" as const, icon: "🕐", label: "时间起卦", desc: "即刻推演，应时而动" },
]

interface Props {
  navigation: NativeStackNavigationProp<any>
}

export default function LandingScreen({ navigation }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState("")
  const [method, setMethod] = useState<"yao" | "number" | "time">("yao")
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!question.trim() || loading) return
    setLoading(true)
    try {
      const result = await qiguaApi.fullPaipan({ method, day_gan: "甲" })
      navigation.navigate("Paipan", {
        data: JSON.stringify(result),
        question: question.trim(),
      })
      setShowForm(false)
      setQuestion("")
    } catch (err: any) {
      // Would use Alert.alert in production
    } finally {
      setLoading(false)
    }
  }

  // Landing view
  if (!showForm) {
    return (
      <SafeAreaView style={s.warm}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={s.scroll}>
          {/* Hero */}
          <View style={s.hero}>
            <View style={s.badge}>
              <Text style={s.badgeText}>AI × 周易</Text>
            </View>
            <Text style={s.title}>
              两难之间，{"\n"}
              <Text style={s.titleAccent}>以卦明辨</Text>
            </Text>
            <Text style={s.subtitle}>
              传承千年六爻智慧，融合现代 AI 技术{"\n"}为你解读每一个卦象背后的深意
            </Text>

            <TouchableOpacity style={s.cta} onPress={() => setShowForm(true)}>
              <Text style={s.ctaText}>☯  开始起卦</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.ctaOutline}
              onPress={() => navigation.navigate("History")}
            >
              <Text style={s.ctaOutlineText}>查看历史</Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={s.features}>
            <Text style={s.sectionLabel}>核心能力</Text>
            <Text style={s.sectionTitle}>为什么选择爻爻</Text>
            {[
              { icon: "☯", title: "六爻正统", desc: "京房八宫卦体系，保证准确性" },
              { icon: "🤖", title: "AI 深度解读", desc: "多维度解析卦象" },
              { icon: "🔮", title: "即时起卦", desc: "三种方式随时起卦" },
            ].map((f) => (
              <View key={f.title} style={s.featureCard}>
                <Text style={s.featureIcon}>{f.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.featureTitle}>{f.title}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Methods */}
          <View style={s.methods}>
            <Text style={s.sectionLabel}>起卦方式</Text>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={s.methodCard}
                onPress={() => {
                  setMethod(m.key)
                  setShowForm(true)
                }}
              >
                <Text style={s.methodIcon}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.methodName}>{m.label}</Text>
                  <Text style={s.methodDesc}>{m.desc}</Text>
                </View>
                <Text style={s.methodArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerBrand}>☯ 爻爻</Text>
            <Text style={s.footerText}>以千年智慧，解今日困惑</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Form overlay
  return (
    <SafeAreaView style={s.formOverlay}>
      <ScrollView contentContainerStyle={s.formScroll}>
        <View style={s.formHeader}>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Text style={s.formClose}>✕</Text>
          </TouchableOpacity>
          <Text style={s.formTitle}>起卦解惑</Text>
          <Text style={s.formSubtitle}>静心凝神，将你的困惑娓娓道来</Text>
        </View>

        <Text style={s.label}>你的困惑</Text>
        <TextInput
          style={s.textarea}
          placeholder="写下你正在纠结的事情……"
          placeholderTextColor="rgba(255,255,255,0.3)"
          multiline
          value={question}
          onChangeText={(t) => setQuestion(t.slice(0, 200))}
          maxLength={200}
        />
        <Text style={s.charCount}>{question.length}/200</Text>

        <Text style={s.label}>起卦方式</Text>
        <View style={s.tabs}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[s.tab, method === m.key && s.tabActive]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={[s.tabText, method === m.key && s.tabTextActive]}>
                {m.icon} {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick chips */}
        <View style={s.chipsWrap}>
          {QUICK_QUESTIONS.map((q) => (
            <TouchableOpacity
              key={q}
              style={[s.chip, question === q && s.chipActive]}
              onPress={() => setQuestion(q)}
            >
              <Text style={[s.chipText, question === q && s.chipTextActive]}>
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.submitBtn, (!question.trim() || loading) && s.submitDisabled]}
          onPress={handleStart}
          disabled={!question.trim() || loading}
        >
          <Text style={s.submitText}>
            {loading ? "起卦中…" : "起卦解惑"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  warm: { flex: 1, backgroundColor: "#ec5930" },
  scroll: { paddingBottom: 40 },
  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "rgba(246,188,79,0.15)",
    borderWidth: 1,
    borderColor: "rgba(246,188,79,0.3)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: { color: "#f6bc4f", fontSize: 13, fontWeight: "600" },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 52,
    letterSpacing: 2,
  },
  titleAccent: { color: "#f6bc4f" },
  subtitle: {
    marginTop: 16,
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  cta: {
    marginTop: 28,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#ec5930",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: { fontSize: 17, fontWeight: "700", color: "#ec5930" },
  ctaOutline: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  ctaOutlineText: { color: "#fff", fontSize: 15 },
  // Features
  features: { backgroundColor: "#faf8f3", padding: 24, paddingVertical: 40 },
  sectionLabel: {
    fontSize: 12,
    color: "#a09888",
    textAlign: "center",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1410",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ebe5d8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  featureIcon: { fontSize: 28, marginRight: 14 },
  featureTitle: { fontSize: 16, fontWeight: "600", color: "#1a1410" },
  featureDesc: { fontSize: 13, color: "#6b6058", marginTop: 2 },
  // Methods
  methods: { backgroundColor: "#f5f2ea", padding: 24, paddingVertical: 40 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ebe5d8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  methodIcon: { fontSize: 28, marginRight: 14 },
  methodName: { fontSize: 16, fontWeight: "600", color: "#1a1410" },
  methodDesc: { fontSize: 13, color: "#6b6058", marginTop: 2 },
  methodArrow: { fontSize: 18, color: "#d4a030" },
  // Footer
  footer: {
    backgroundColor: "#1a1410",
    padding: 32,
    alignItems: "center",
  },
  footerBrand: { fontSize: 18, fontWeight: "700", color: "#fff" },
  footerText: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  // Form
  formOverlay: { flex: 1, backgroundColor: "rgba(26,20,16,0.95)" },
  formScroll: { padding: 24, paddingTop: 40 },
  formHeader: { marginBottom: 24 },
  formClose: { fontSize: 22, color: "rgba(255,255,255,0.5)", paddingBottom: 12 },
  formTitle: { fontSize: 26, fontWeight: "700", color: "#fff" },
  formSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  label: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8, marginTop: 16 },
  textarea: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: { textAlign: "right", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#f6bc4f" },
  tabText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  tabTextActive: { color: "#1a1410", fontWeight: "600" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 },
  chip: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "rgba(246,188,79,0.15)", borderColor: "#f6bc4f" },
  chipText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  chipTextActive: { color: "#f6bc4f" },
  submitBtn: {
    marginTop: 24,
    backgroundColor: "#ec5930",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#ec5930",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
})
