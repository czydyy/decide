// ============================================================
// Qigua API — typed endpoint functions
// ============================================================

import type { HttpAdapter, RequestOptions } from "../httpAdapter"
import type {
  QiguaResponse,
  PaipanData,
  PaipanRequest,
  NumberQiguaRequest,
  ManualQiguaRequest,
} from "../../types"

export function createQiguaApi(client: HttpAdapter) {
  const post = <T>(path: string, body?: unknown): Promise<T> =>
    client.request<T>(path, { method: "POST", body })

  return {
    /** 铜钱摇卦 */
    coinToss: () => post<QiguaResponse>("/api/qigua/yao"),

    /** 数字起卦 */
    numberQigua: (req: NumberQiguaRequest) =>
      post<QiguaResponse>("/api/qigua/number", req),

    /** 时间起卦 */
    timeQigua: () => post<QiguaResponse>("/api/qigua/time"),

    /** 手动排盘 */
    manualQigua: (req: ManualQiguaRequest) =>
      post<QiguaResponse>("/api/qigua/manual", req),

    /** 完整排盘（起卦+排盘一步完成） */
    fullPaipan: (req: PaipanRequest) =>
      post<PaipanData>("/api/qigua/paipan", req),
  }
}

export type QiguaApi = ReturnType<typeof createQiguaApi>
