import { useState, useEffect } from "react"
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { qiguaApi } from "@/lib/api"
import { yaoSymbol } from "@liuyao/shared"
import type { PaipanData } from "@liuyao/shared"

interface Props {
  navigation: NativeStackNavigationProp<any>
  route: RouteProp<any>
}

export default function PaipanScreen({ navigation, route }: Props) {
  const [data, setData] = useState<PaipanData | null>(null)
  const [loading, setLoading] = useState(true)
  const question = (route.params as any)?.question ?? ""

  useEffect(() => {
    const params = route.params as any
    if (params?.data) {
      try {
        setData(JSON.parse(params.data))
      } catch { /* ignore */ }
    }
    setLoading(false)
  }, [route.params])

  if (loading) {
    return (
      <SafeAreaView style={styles.warm}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>正在起卦...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.warm}>
        <View style={styles.center}>
          <Text style={{ color: "#fff" }}>起卦失败</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: "#f6bc4f", marginTop: 12 }}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.warm}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>卦象结果</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Question */}
        {question ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>你所问</Text>
            <Text style={styles.questionText}>{question}</Text>
          </View>
        ) : null}

        {/* Gua Hero */}
        <View style={styles.card}>
          <Text style={styles.symbol}>{data.ben_gua.symbol}</Text>
          <Text style={styles.guaName}>{data.ben_gua.name}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{data.palace}宫</Text>
            </View>
            <View style={[styles.badge, styles.badgeGold]}>
              <Text style={[styles.badgeText, { color: "#b8891e" }]}>
                {data.palace_element}
              </Text>
            </View>
          </View>
          {data.ben_gua.gua_ci ? (
            <Text style={styles.guaCi}>「{data.ben_gua.gua_ci}」</Text>
          ) : null}
        </View>

        {/* Lines */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>六爻详情</Text>
          {[...data.lines].reverse().map((line) => (
            <View key={line.position} style={styles.lineRow}>
              <Text style={styles.linePos}>{line.position}</Text>
              <Text style={styles.lineYao}>
                {yaoSymbol(line.yao_type, line.changing)}
                {line.changing ? " ○" : ""}
              </Text>
              <Text style={styles.lineDetail}>{line.najia}</Text>
              <Text style={styles.lineDetail}>{line.liuqin}</Text>
              <Text style={styles.lineDetail}>{line.liushou}</Text>
              <Text style={[styles.lineShiying, line.shiying === "世" && { color: "#f6bc4f" }]}>
                {line.shiying}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() =>
            navigation.navigate("Chat", {
              data: JSON.stringify(data),
              question,
            })
          }
        >
          <Text style={styles.ctaBtnText}>查看 AI 解读 →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  warm: { flex: 1, backgroundColor: "#ec5930" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  backBtn: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  navTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  body: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "rgba(20,16,12,0.78)",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  cardLabel: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 6 },
  questionText: { color: "#fff", fontSize: 17, fontWeight: "500" },
  symbol: { fontSize: 48, textAlign: "center", color: "#fff" },
  guaName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
  },
  badges: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 10 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeGold: { backgroundColor: "rgba(246,188,79,0.15)" },
  badgeText: { color: "#fff", fontSize: 12 },
  guaCi: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    fontStyle: "italic",
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 10,
  },
  linePos: { color: "rgba(255,255,255,0.4)", width: 20, fontSize: 13 },
  lineYao: { color: "#fff", fontSize: 16, width: 40, fontFamily: "monospace" },
  lineDetail: { color: "rgba(255,255,255,0.7)", fontSize: 13, flex: 1 },
  lineShiying: { width: 30, fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" },
  ctaBtn: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#ec5930",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaBtnText: { color: "#ec5930", fontSize: 17, fontWeight: "700" },
})
