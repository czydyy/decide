// ============================================================
// Hexagram API — typed endpoint functions
// ============================================================

import type { HttpAdapter } from "../httpAdapter"

export interface HexagramItem {
  index: number
  name: string
  symbol: string
  upper_gua: string
  lower_gua: string
  gua_ci?: string
}

export interface HexagramDetail extends HexagramItem {
  yao_ci: Record<string, string>
  tuan_ci?: string | null
  xiang_ci?: string | null
  yao_xiang?: Record<string, string> | null
  interpretation?: string | null
}

export interface BaguaInfo {
  [trigramName: string]: {
    element: string
    nature: string
    direction: string
    family: string
    body: string
    binary: string
  }
}

export function createHexagramApi(client: HttpAdapter) {
  return {
    /** List all 64 hexagrams */
    list: () => client.request<HexagramItem[]>("/api/hexagrams"),

    /** Get single hexagram detail by index (1-64) */
    get: (index: number) =>
      client.request<HexagramDetail>(`/api/hexagrams/${index}`),

    /** Search hexagrams by name */
    search: (name: string) =>
      client.request<HexagramItem[]>(`/api/hexagrams/search/${encodeURIComponent(name)}`),

    /** Get bagua (trigram) info */
    baguaInfo: () => client.request<BaguaInfo>("/api/hexagrams/bagua/info"),
  }
}

export type HexagramApi = ReturnType<typeof createHexagramApi>
