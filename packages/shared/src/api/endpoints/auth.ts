// ============================================================
// Auth API — typed endpoint functions
// ============================================================

import type { HttpAdapter } from "../httpAdapter"
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendSmsRequest,
  SmsResponse,
  UserInfo,
} from "../../types"

export function createAuthApi(client: HttpAdapter) {
  return {
    /** Send SMS verification code */
    sendSms: (req: SendSmsRequest) =>
      client.request<SmsResponse>("/api/auth/send-sms", { method: "POST", body: req }),

    /** Login with phone + password */
    login: (req: LoginRequest) =>
      client.request<AuthResponse>("/api/auth/login", { method: "POST", body: req }),

    /** Register new account */
    register: (req: RegisterRequest) =>
      client.request<AuthResponse>("/api/auth/register", { method: "POST", body: req }),

    /** WeChat login (code-based) */
    wechatLogin: (code: string) =>
      client.request<AuthResponse>(`/api/auth/wechat-login?code=${encodeURIComponent(code)}`, {
        method: "POST",
      }),

    /** Get current user profile (requires auth token) */
    profile: () => client.request<UserInfo>("/api/auth/profile"),
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
