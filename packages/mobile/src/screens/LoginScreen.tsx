import { useState, useEffect } from "react"
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useAuth } from "@liuyao/shared"
import { tokenManager, authApi, setCachedToken } from "@/lib/api"

interface Props {
  navigation: NativeStackNavigationProp<any>
}

export default function LoginScreen({ navigation }: Props) {
  const { isLoggedIn, login, register: doRegister } = useAuth(tokenManager, authApi)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoggedIn) navigation.goBack()
  }, [isLoggedIn])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const sendSms = async () => {
    if (phone.length !== 11) return
    try {
      await authApi.sendSms({ phone })
      setCountdown(60)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (mode === "login") {
        await login(phone, password)
      } else {
        if (password !== password2) {
          setError("两次密码不一致")
          setLoading(false)
          return
        }
        await doRegister(phone, password, smsCode)
      }
      setCachedToken(await tokenManager.getToken())
      navigation.goBack()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    phone.length === 11 &&
    password.length >= 6 &&
    (mode === "login" || (password === password2 && smsCode.length >= 4))

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.brand}>☯ 爻爻</Text>

        <View style={styles.tabs}>
          {(["login", "register"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === "login" ? "登录" : "注册"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="手机号"
          keyboardType="phone-pad"
          maxLength={11}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
        />

        {mode === "register" && (
          <View style={styles.smsRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="验证码"
              keyboardType="number-pad"
              maxLength={6}
              value={smsCode}
              onChangeText={(t) => setSmsCode(t.replace(/\D/g, ""))}
            />
            <TouchableOpacity
              style={[styles.smsBtn, countdown > 0 && { opacity: 0.4 }]}
              onPress={sendSms}
              disabled={countdown > 0}
            >
              <Text style={styles.smsBtnText}>
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="密码"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {mode === "register" && (
          <TextInput
            style={styles.input}
            placeholder="确认密码"
            secureTextEntry
            value={password2}
            onChangeText={setPassword2}
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, !isValid && { opacity: 0.4 }]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
        >
          <Text style={styles.btnText}>
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#faf8f3" },
  header: { padding: 16 },
  close: { fontSize: 20, color: "#a09888" },
  body: { paddingHorizontal: 24 },
  brand: { fontSize: 24, fontWeight: "700", color: "#1a1410", textAlign: "center", marginBottom: 24 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(235,229,216,0.5)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#fff" },
  tabText: { fontSize: 14, color: "#6b6058" },
  tabTextActive: { fontWeight: "600", color: "#1a1410" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ebe5d8",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1a1410",
    marginBottom: 12,
  },
  smsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  smsBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#d4a030",
    borderRadius: 10,
    marginBottom: 12,
  },
  smsBtnText: { color: "#b8891e", fontSize: 13 },
  error: { color: "#ec5930", fontSize: 13, textAlign: "center", marginBottom: 12 },
  btn: {
    backgroundColor: "#ec5930",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})
