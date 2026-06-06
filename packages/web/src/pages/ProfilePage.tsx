import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"
import { useTheme } from "@/providers/ThemeProvider"
import Button from "@/components/ui/Button"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, loading } = useAuthContext()
  const { setMode } = useTheme()

  useEffect(() => {
    setMode("clean")
    return () => setMode("clean")
  }, [setMode])

  const handleLogout = async () => {
    if (!confirm("确定退出登录？")) return
    await logout()
    navigate("/", { replace: true })
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
          <span className="text-ink font-medium">个人中心</span>
        </div>
      </nav>

      <div className="max-w-[480px] mx-auto px-6 py-8">
        {loading ? (
          <div className="mt-12 text-center">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : !isLoggedIn ? (
          /* Logged out */
          <div className="mt-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gold-soft rounded-full flex items-center justify-center text-3xl">
              爻
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink">未登录</h2>
            <p className="mt-1 text-sm text-ink-sec">登录后可查看占卜记录</p>
            <Button className="mt-6" onClick={() => navigate("/login")}>
              登录 / 注册
            </Button>
          </div>
        ) : (
          /* Logged in */
          <>
            {/* Profile card */}
            <div className="bg-white border border-clean-border rounded-lg p-6 text-center shadow-card">
              <div className="w-16 h-16 mx-auto bg-gold/20 rounded-full flex items-center justify-center text-2xl font-bold text-gold-text">
                {user?.nickname?.[0] ?? "爻"}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-ink">{user?.nickname ?? "用户"}</h2>
              {user?.phone && (
                <p className="text-sm text-ink-sec">
                  {user.phone.slice(0, 3)}****{user.phone.slice(-4)}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { value: "12", label: "占卜次数" },
                { value: "64", label: "已学卦象" },
                { value: "3", label: "收藏解读" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-clean-border rounded-md p-4 text-center">
                  <p className="text-xl font-bold text-ink">{s.value}</p>
                  <p className="text-xs text-ink-dim mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Menu */}
            <div className="mt-4 bg-white border border-clean-border rounded-lg overflow-hidden">
              {[
                { label: "我的解读", onClick: () => navigate("/history") },
                { label: "收藏解读", onClick: () => alert("功能开发中") },
                { label: "设置", onClick: () => alert("功能开发中") },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full px-6 py-4 text-left text-ink hover:bg-clean-bg transition-colors flex items-center justify-between ${
                    i > 0 ? "border-t border-clean-border" : ""
                  }`}
                >
                  {item.label}
                  <span className="text-ink-dim">→</span>
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-6 w-full py-3 text-sm text-ink-dim hover:text-accent transition-colors"
            >
              退出登录
            </button>

            <p className="mt-8 text-center text-xs text-ink-dim">爻爻 · 以卦明辨</p>
          </>
        )}
      </div>
    </div>
  )
}
