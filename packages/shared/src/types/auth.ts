// ============================================================
// Auth Types — mirrors backend User + auth endpoints
// ============================================================

/** User profile info */
export interface UserInfo {
  id: string
  nickname: string
  avatar_url?: string | null
  phone?: string | null
}

/** Auth response (login/register) */
export interface AuthResponse extends UserInfo {
  token: string
}

/** Send SMS request */
export interface SendSmsRequest {
  phone: string
}

/** Login request (phone + password) */
export interface LoginRequest {
  phone: string
  password: string
}

/** Register request */
export interface RegisterRequest {
  phone: string
  password: string
  sms_code: string
}

/** SMS send response */
export interface SmsResponse {
  ok: boolean
  message: string
}
