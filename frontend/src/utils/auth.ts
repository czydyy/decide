import Taro from '@tarojs/taro';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface UserInfo {
  id: string;
  nickname: string;
  avatar_url?: string;
  phone?: string;
}

export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function getUser(): UserInfo | null {
  try {
    return Taro.getStorageSync(USER_KEY) || null;
  } catch {
    return null;
  }
}

export function setUser(user: UserInfo): void {
  Taro.setStorageSync(USER_KEY, user);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  Taro.removeStorageSync(TOKEN_KEY);
  Taro.removeStorageSync(USER_KEY);
}
