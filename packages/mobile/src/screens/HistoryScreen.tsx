import { useState, useEffect } from "react"
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { historyApi } from "@/lib/api"
import { formatDate, formatDongYao } from "@liuyao/shared"
import type { HistoryItem } from "@liuyao/shared"

interface Props {
  navigation: NativeStackNavigationProp<any>
}

const METHOD_LABELS: Record<string, string> = {
  yao: "铜钱", number: "数字", time: "时间", manual: "手动",
}

export default function HistoryScreen({ navigation }: Props) {
  const [records, setRecords] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyApi.list(1, 50).then(setRecords).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleDelete = (id: string) => {
    Alert.alert("删除记录", "确定删除这条记录？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          try {
            await historyApi.delete(id)
            setRecords((p) => p.filter((r) => r.id !== id))
          } catch { /* ignore */ }
        },
      },
    ])
  }

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Main", {
          screen: "History",
          params: { recordId: item.id },
        })
      }
    >
      <View style={styles.cardLeft}>
        <Text style={styles.cardIcon}>☰</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName}>{item.ben_gua_name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{METHOD_LABELS[item.method] ?? item.method}</Text>
          </View>
        </View>
        {item.question ? <Text style={styles.cardQ}>{item.question}</Text> : null}
        {item.dong_yao?.length ? (
          <Text style={styles.cardDong}>{formatDongYao(item.dong_yao)}</Text>
        ) : null}
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.delBtn}>删除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>历史记录</Text>
        <Text style={styles.subtitle}>过往占卜，随时回顾</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: "#6b6058" }}>加载中...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 32 }}>📜</Text>
          <Text style={{ color: "#6b6058", marginTop: 8 }}>还没有占卜记录</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#faf8f3" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { padding: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1410" },
  subtitle: { fontSize: 14, color: "#6b6058", marginTop: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ebe5d8",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(212,160,48,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardIcon: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#1a1410" },
  badge: {
    backgroundColor: "rgba(236,89,48,0.08)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: "#ec5930" },
  cardQ: { fontSize: 13, color: "#6b6058", marginTop: 2 },
  cardDong: { fontSize: 12, color: "#a09888", marginTop: 2 },
  cardDate: { fontSize: 11, color: "#a09888", marginTop: 4 },
  delBtn: { fontSize: 12, color: "#a09888", paddingLeft: 8 },
})
