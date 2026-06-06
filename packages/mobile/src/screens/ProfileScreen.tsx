import { useEffect } from "react"
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useAuth } from "@liuyao/shared"
import { tokenManager, authApi, setCachedToken } from "@/lib/api"

interface Props {
  navigation: NativeStackNavigationProp<any>
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, loading, isLoggedIn, logout } = useAuth(tokenManager, authApi)

  useEffect(() => {
    if (isLoggedIn) {
      tokenManager.getToken().then((t) => setCachedToken(t))
    }
  }, [isLoggedIn])

  const handleLogout = () => {
    Alert.alert("退出登录", "确定退出？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出",
        style: "destructive",
        onPress: async () => {
          await logout()
          setCachedToken(null)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>个人中心</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: "#6b6058" }}>加载中...</Text>
        </View>
      ) : !isLoggedIn ? (
        <View style={styles.center}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>爻</Text>
          </View>
          <Text style={styles.name}>未登录</Text>
          <Text style={styles.hint}>登录后可查看占卜记录</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginBtnText}>登录 / 注册</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.nickname?.[0] ?? "爻"}</Text>
            </View>
            <Text style={styles.name}>{user?.nickname ?? "用户"}</Text>
            <Text style={styles.phone}>
              {user?.phone
                ? `${user.phone.slice(0, 3)}****${user.phone.slice(-4)}`
                : ""}
            </Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("History")}>
            <Text style={styles.menuLabel}>我的解读</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>爻爻 · 以卦明辨</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#faf8f3" },
  header: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1410" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 },
  body: { padding: 20 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(212,160,48,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#b8891e" },
  name: { fontSize: 18, fontWeight: "600", color: "#1a1410", marginTop: 12 },
  phone: { fontSize: 14, color: "#6b6058", marginTop: 2 },
  hint: { fontSize: 14, color: "#6b6058", marginTop: 4 },
  loginBtn: {
    marginTop: 20,
    backgroundColor: "#ec5930",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ebe5d8",
    padding: 24,
  },
  menuItem: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ebe5d8",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuLabel: { fontSize: 15, color: "#1a1410" },
  menuArrow: { color: "#a09888", fontSize: 16 },
  logoutBtn: { marginTop: 24, alignItems: "center" },
  logoutText: { fontSize: 14, color: "#a09888" },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#a09888",
    marginTop: 32,
  },
})
