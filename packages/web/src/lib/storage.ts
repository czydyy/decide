// ============================================================
// Web Storage Adapter — localStorage wrapper for TokenManager
// ============================================================

import type { StorageAdapter } from "@liuyao/shared"

export const webStorage: StorageAdapter = {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
  },
  removeItem(key: string): void {
    localStorage.removeItem(key)
  },
}
