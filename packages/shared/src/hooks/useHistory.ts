// ============================================================
// useHistory Hook — history list management
// ============================================================

import { useState, useEffect, useCallback } from "react"
import type { HistoryApi, HistoryItem } from "../api"

export interface UseHistoryReturn {
  records: HistoryItem[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  remove: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

export function useHistory(historyApi: HistoryApi): UseHistoryReturn {
  const [records, setRecords] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await historyApi.list(1, 50)
      setRecords(items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "加载历史失败"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [historyApi])

  const remove = useCallback(
    async (id: string) => {
      try {
        await historyApi.delete(id)
        setRecords((prev) => prev.filter((r) => r.id !== id))
      } catch (err: unknown) {
        throw err
      }
    },
    [historyApi]
  )

  const toggleFavorite = useCallback(
    async (id: string) => {
      try {
        const res = await historyApi.toggleFavorite(id)
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_favorite: res.is_favorite } : r))
        )
      } catch (err: unknown) {
        throw err
      }
    },
    [historyApi]
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  return { records, loading, error, refresh, remove, toggleFavorite }
}
