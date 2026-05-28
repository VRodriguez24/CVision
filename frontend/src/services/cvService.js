import { apiClient } from './apiClient.js';

export async function createCv(payload) {
  const response = await apiClient('/cvs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data.cv;
}

export async function listCvs() {
  const response = await apiClient('/cvs');
  return response.data.cvs;
}
