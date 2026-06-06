// ============================================================
// AuthProvider — React context for authentication state
// ============================================================

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAuth } from "@liuyao/shared"
import type { UseAuthReturn } from "@liuyao/shared"
import { tokenManager, authApi, setCachedToken } from "@/lib/api"

const AuthContext = createContext<UseAuthReturn | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(tokenManager, authApi)

  // Sync cached token after auth state changes
  useEffect(() => {
    if (auth.isLoggedIn) {
      tokenManager.getToken().then((t) => setCachedToken(t))
    } else {
      setCachedToken(null)
    }
  }, [auth.isLoggedIn])

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): UseAuthReturn {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return ctx
}
