// ============================================================
// useAuth Hook — platform-agnostic auth state
// ============================================================

import { useState, useEffect, useCallback } from "react"
import type { TokenManager } from "../auth"
import type { AuthApi } from "../api"
import type { UserInfo, LoginRequest, RegisterRequest } from "../types"

export interface UseAuthReturn {
  user: UserInfo | null
  loading: boolean
  error: string | null
  isLoggedIn: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (phone: string, password: string, smsCode: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(
  tokenManager: TokenManager,
  authApi: AuthApi
): UseAuthReturn {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.profile()
      setUser(profile)
    } catch {
      setUser(null)
    }
  }, [authApi])

  // Check existing auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        const hasToken = await tokenManager.hasToken()
        if (hasToken) {
          await refreshProfile()
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [tokenManager, refreshProfile])

  const login = useCallback(
    async (phone: string, password: string) => {
      setError(null)
      setLoading(true)
      try {
        const res = await authApi.login({ phone, password })
        await tokenManager.setToken(res.token)
        setUser({
          id: res.id,
          nickname: res.nickname,
          avatar_url: res.avatar_url,
          phone: res.phone,
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "登录失败"
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [authApi, tokenManager]
  )

  const register = useCallback(
    async (phone: string, password: string, smsCode: string) => {
      setError(null)
      setLoading(true)
      try {
        const res = await authApi.register({ phone, password, sms_code: smsCode })
        await tokenManager.setToken(res.token)
        setUser({
          id: res.id,
          nickname: res.nickname,
          avatar_url: res.avatar_url,
          phone: res.phone,
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "注册失败"
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [authApi, tokenManager]
  )

  const logout = useCallback(async () => {
    await tokenManager.clearToken()
    setUser(null)
  }, [tokenManager])

  return {
    user,
    loading,
    error,
    isLoggedIn: user !== null,
    login,
    register,
    logout,
    refreshProfile,
  }
}
