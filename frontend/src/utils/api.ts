// API client for 六爻决策助手 backend
import { getToken } from './auth';

const BASE_URL = 'http://localhost:8000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const token = getToken();
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// 起卦 API
export const qiguaApi = {
  yao: () => request('/api/qigua/yao', { method: 'POST' }),
  number: (n1: number, n2: number, n3: number) =>
    request('/api/qigua/number', { method: 'POST', body: { n1, n2, n3 } }),
  time: () => request('/api/qigua/time', { method: 'POST' }),
  manual: (hexagramIndex: number, dongYao: number[]) =>
    request('/api/qigua/manual', { method: 'POST', body: { hexagram_index: hexagramIndex, dong_yao: dongYao } }),
  paipan: (params: Record<string, unknown>) =>
    request('/api/qigua/paipan', { method: 'POST', body: params }),
};

// 卦象 API
export const hexagramApi = {
  list: () => request('/api/hexagrams'),
  get: (index: number) => request(`/api/hexagrams/${index}`),
  search: (name: string) => request(`/api/hexagrams/search/${encodeURIComponent(name)}`),
};

// AI 解读 API
export const interpretApi = {
  stream: (params: Record<string, unknown>) =>
    request('/api/interpret', { method: 'POST', body: params }),
};

// 历史记录 API
export const historyApi = {
  list: (page = 1, size = 20) => request(`/api/history?page=${page}&size=${size}`),
  get: (id: string) => request(`/api/history/${id}`),
  delete: (id: string) => request(`/api/history/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id: string) => request(`/api/history/${id}/favorite`, { method: 'POST' }),
};

// 用户 API
export const authApi = {
  login: (code: string) => request('/api/auth/wechat-login', { method: 'POST', body: { code } }),
  phoneLogin: (phone: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: { phone, password } }),
  register: (phone: string, password: string, smsCode: string) =>
    request('/api/auth/register', { method: 'POST', body: { phone, password, sms_code: smsCode } }),
  sendSms: (phone: string) =>
    request('/api/auth/send-sms', { method: 'POST', body: { phone } }),
  profile: () => request('/api/auth/profile'),
};

// 对话 API
export const conversationApi = {
  create: (params: Record<string, unknown>) =>
    request('/api/conversations', { method: 'POST', body: params }),
  list: (page = 1, size = 20) =>
    request(`/api/conversations?page=${page}&size=${size}`),
  getMessages: (convId: string) =>
    request(`/api/conversations/${convId}/messages`),
  delete: (convId: string) =>
    request(`/api/conversations/${convId}`, { method: 'DELETE' }),
};

// SSE streaming for multi-turn conversation
export function streamConversation(
  convId: string,
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): AbortController {
  const controller = new AbortController();

  const token = getToken();
  fetch(`${BASE_URL}/api/conversations/${convId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('请求失败');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            onChunk(data);
          }
        }
      }

      // Process remaining buffer
      if (buffer) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            onChunk(line.slice(6));
          }
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    });

  return controller;
}
