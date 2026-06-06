// ============================================================
// ThemeProvider — warm/clean visual mode context
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

type ThemeMode = "warm" | "clean"

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  isWarm: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "clean",
  setMode: () => {},
  isWarm: false,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Default to clean; pages will override as needed
    return "clean"
  })

  useEffect(() => {
    document.documentElement.className = mode === "warm" ? "theme-warm" : ""
  }, [mode])

  const value: ThemeContextValue = {
    mode,
    setMode,
    isWarm: mode === "warm",
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
