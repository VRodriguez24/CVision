import { apiClient } from './apiClient.js';

export async function login(credentials) {
  const response = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return response.data;
}

export async function register(payload) {
  const response = await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function verifyEmail(token) {
  const response = await apiClient('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  return response.data;
}

export async function refreshSession(refreshToken) {
  const response = await apiClient('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  return response.data;
}

export async function logout(refreshToken) {
  await apiClient('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function forgotPassword(email) {
  const response = await apiClient('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  return response.data;
}

export async function getMe() {
  const response = await apiClient('/users/me');
  return response.data.user;
}
