// ============================================================
// History API — typed endpoint functions
// ============================================================

import type { HttpAdapter } from "../httpAdapter"

export interface HistoryItem {
  id: string
  question?: string | null
  method: string
  ben_gua_name: string
  dong_yao: number[]
  ai_interpretation?: string | null
  is_favorite: boolean
  created_at: string
}

export interface HistoryDetail extends HistoryItem {
  method_params?: Record<string, unknown> | null
  ben_gua_id: number
  hu_gua_id?: number | null
  bian_gua_id?: number | null
  zong_gua_id?: number | null
  paipan_result?: Record<string, unknown> | null
}

export function createHistoryApi(client: HttpAdapter) {
  return {
    /** List history records (paginated) */
    list: (page = 1, size = 20) =>
      client.request<HistoryItem[]>(`/api/history?page=${page}&size=${size}`),

    /** Get single history record detail */
    get: (id: string) =>
      client.request<HistoryDetail>(`/api/history/${id}`),

    /** Delete a history record */
    delete: (id: string) =>
      client.request<{ message: string }>(`/api/history/${id}`, { method: "DELETE" }),

    /** Toggle favorite */
    toggleFavorite: (id: string) =>
      client.request<{ is_favorite: boolean }>(`/api/history/${id}/favorite`, {
        method: "POST",
      }),
  }
}

export type HistoryApi = ReturnType<typeof createHistoryApi>
