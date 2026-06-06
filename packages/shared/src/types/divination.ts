// ============================================================
// Divination Types — mirrors backend PaipanResult, QiguaResult
// ============================================================

/** A single line from a hexagram generation result */
export interface QiguaLine {
  position: number
  value?: number        // 6/7/8/9 (only for yao method)
  yao_str: string       // display string like "少阳 ⚊"
  type: "yin" | "yang"
  changing: boolean
}

/** Response from qigua endpoints (yao/number/time/manual) */
export interface QiguaResponse {
  method: "yao" | "number" | "time" | "manual"
  lines: QiguaLine[]
  ben_gua_index: number
  ben_gua_name: string
  ben_gua_symbol: string
  dong_yao: number[]
  upper_gua?: string
  lower_gua?: string
}

/** A single line in the full paipan (after najia, liuqin, etc.) */
export interface PaipanLine {
  position: number
  yao_type: "yin" | "yang"
  changing: boolean
  najia: string           // e.g. "甲子"
  liuqin: string          // 六亲: 兄弟/父母/子孙/妻财/官鬼
  liushou: string         // 六兽: 青龙/朱雀/勾陈/螣蛇/白虎/玄武
  shiying: string         // "世", "应", or ""
}

/** Basic hexagram info */
export interface GuaInfo {
  index?: number
  name: string
  symbol: string
  upper_gua?: string
  lower_gua?: string
  gua_ci?: string
  interpretation?: string
}

/** Full paipan response from POST /api/qigua/paipan */
export interface PaipanData {
  ben_gua: GuaInfo
  bian_gua: GuaInfo | null
  hu_gua: GuaInfo | null
  zong_gua: GuaInfo | null
  dong_yao: number[]
  shi_position: number
  ying_position: number
  palace: string
  palace_element: string
  lines: PaipanLine[]
}

/** Request body for POST /api/qigua/paipan */
export interface PaipanRequest {
  method: "yao" | "number" | "time" | "manual"
  day_gan?: string
  n1?: number
  n2?: number
  n3?: number
  hexagram_index?: number
  dong_yao?: number[]
}

/** Request body for number-based qigua */
export interface NumberQiguaRequest {
  n1: number
  n2: number
  n3: number
  day_gan?: string
}

/** Request body for manual qigua */
export interface ManualQiguaRequest {
  hexagram_index: number
  dong_yao?: number[]
  day_gan?: string
}
