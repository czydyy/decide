// ============================================================
// Auth — Token Manager + Storage Adapter
// ============================================================

/** Platform-agnostic storage interface */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

/** Manages auth token persistence across platforms */
export class TokenManager {
  constructor(
    private storage: StorageAdapter,
    private tokenKey = "auth_token"
  ) {}

  async getToken(): Promise<string | null> {
    return await this.storage.getItem(this.tokenKey)
  }

  async setToken(token: string): Promise<void> {
    await this.storage.setItem(this.tokenKey, token)
  }

  async clearToken(): Promise<void> {
    await this.storage.removeItem(this.tokenKey)
  }

  async hasToken(): Promise<boolean> {
    const token = await this.getToken()
    return token !== null && token.length > 0
  }
}
