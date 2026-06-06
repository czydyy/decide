// ============================================================
// Conversation Types — mirrors backend Conversation + Message
// ============================================================

import type { GuaInfo, PaipanLine } from "./divination"

/** Conversation creation request */
export interface CreateConversationRequest {
  question: string
  category?: string
  method?: string
  n1?: number | null
  n2?: number | null
  n3?: number | null
  hexagram_index?: number | null
  dong_yao?: number[]
  day_gan?: string
  month_zhi?: string
  day_zhi?: string
}

/** Paipan summary returned from conversation creation */
export interface PaipanSummary {
  ben_gua: GuaInfo
  bian_gua: GuaInfo | null
  hu_gua: GuaInfo | null
  zong_gua: GuaInfo | null
  dong_yao: number[]
  lines: PaipanLine[]
}

/** Response from POST /api/conversations */
export interface CreateConversationResponse {
  conversation_id: string
  title: string
  paipan: PaipanSummary
  ben_gua_name: string
}

/** A single message in a conversation */
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  metadata?: Record<string, unknown> | null
  created_at?: string
}

/** Conversation list item */
export interface ConversationItem {
  id: string
  title: string
  category: string
  message_count: number
  created_at: string
  updated_at: string
}

/** Stream message request */
export interface StreamMessageRequest {
  content: string
}
