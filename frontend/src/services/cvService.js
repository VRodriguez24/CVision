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

export async function getCvById(cvId) {
  const response = await apiClient(`/cvs/${cvId}`);
  return response.data;
}

export async function updateCv(cvId, payload) {
  const response = await apiClient(`/cvs/${cvId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function renameCv(cvId, payload) {
  const response = await apiClient(`/cvs/${cvId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return response.data.cv;
}

export async function deleteCv(cvId) {
  await apiClient(`/cvs/${cvId}`, {
    method: 'DELETE',
  });
}
