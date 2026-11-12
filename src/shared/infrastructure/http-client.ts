import { ref } from 'vue';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const demoMode = ref(false);
let csrf = '';
let session: Promise<void> | undefined;
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
export async function ensureSession() {
  if (!session)
    session = fetch(`${API_BASE_URL}/sessions`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new ApiError('SERVICE_UNAVAILABLE', r.status);
        const data = await r.json();
        csrf = data.csrfToken;
        demoMode.value = data.demo;
      })
      .catch((e) => {
        session = undefined;
        throw e;
      });
  return session;
}
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  await ensureSession();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf, ...options.headers },
      signal: options.signal || AbortSignal.timeout(8000),
    });
  } catch {
    throw new ApiError('SERVICE_UNAVAILABLE', 503);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      session = undefined;
      csrf = '';
    }
    throw new ApiError(data.code || 'REQUEST_FAILED', response.status);
  }
  return response.json() as Promise<T>;
}
