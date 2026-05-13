const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

let accessTokenProvider = () => null;
let unauthorizedHandler = null;

export function setAccessTokenProvider(provider) {
  accessTokenProvider = provider;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function apiClient(path, options = {}) {
  const token = accessTokenProvider();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    const error = new Error(payload?.error?.message ?? `API request failed with status ${response.status}`);
    error.status = response.status;
    error.code = payload?.error?.code;
    error.details = payload?.error?.details ?? [];
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
