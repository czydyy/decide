import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"
import { useTheme } from "@/providers/ThemeProvider"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register: doRegister, isLoggedIn } = useAuthContext()
  const { setMode } = useTheme()
  const [mode, setMode_] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode("clean")
    return () => setMode("clean")
  }, [setMode])

  useEffect(() => {
    if (isLoggedIn) navigate("/profile", { replace: true })
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const sendSms = async () => {
    if (phone.length !== 11 || countdown > 0) return
    try {
      await authApi.sendSms({ phone })
      setCountdown(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "发送失败")
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
      navigate("/profile", { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "操作失败")
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    phone.length === 11 && password.length >= 6 && (mode === "login" || (password === password2 && smsCode.length >= 4))

  return (
    <div className="min-h-screen bg-clean-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-4xl">☯</span>
          <h1 className="mt-2 text-2xl font-bold text-ink">爻爻</h1>
          <p className="text-sm text-ink-sec">登录后可同步占卜记录</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-clean-border rounded-lg p-8 shadow-card">
          {/* Tabs */}
          <div className="flex bg-clean-bg/50 rounded-md p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode_(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all ${
                  mode === m ? "bg-white text-ink shadow-sm" : "text-ink-sec"
                }`}
              >
                {m === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm text-ink-sec mb-1">手机号</label>
            <input
              type="tel"
              maxLength={11}
              className="w-full px-4 py-3 border border-clean-border rounded-md text-ink placeholder-ink-dim focus:outline-none focus:border-gold"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            />
          </div>

          {/* SMS code (register) */}
          {mode === "register" && (
            <div className="mb-4 flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-ink-sec mb-1">验证码</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-clean-border rounded-md text-ink focus:outline-none focus:border-gold"
                  placeholder="验证码"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={sendSms}
                  disabled={phone.length !== 11 || countdown > 0}
                  className="px-4 py-3 text-sm text-gold-text border border-gold/30 rounded-md disabled:opacity-40 whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>
          )}

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm text-ink-sec mb-1">密码</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-clean-border rounded-md text-ink focus:outline-none focus:border-gold"
              placeholder="6-20位密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm password (register) */}
          {mode === "register" && (
            <div className="mb-6">
              <label className="block text-sm text-ink-sec mb-1">确认密码</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-clean-border rounded-md text-ink focus:outline-none focus:border-gold"
                placeholder="再次输入密码"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mb-4 text-sm text-accent text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent-hover disabled:opacity-40 transition-all shadow-cta"
          >
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>

          <p className="mt-4 text-xs text-ink-dim text-center">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              onClick={() => setMode_(mode === "login" ? "register" : "login")}
              className="text-gold-text ml-1"
            >
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
