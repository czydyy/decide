// ============================================================
// Types — barrel export
// ============================================================

export type {
  QiguaLine,
  QiguaResponse,
  PaipanLine,
  GuaInfo,
  PaipanData,
  PaipanRequest,
  NumberQiguaRequest,
  ManualQiguaRequest,
} from "./divination"

export type {
  CreateConversationRequest,
  CreateConversationResponse,
  PaipanSummary,
  Message,
  ConversationItem,
  StreamMessageRequest,
} from "./conversation"

export type {
  UserInfo,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendSmsRequest,
  SmsResponse,
} from "./auth"

export type { ApiError, PaginatedResponse, SSEEvent } from "./api"
