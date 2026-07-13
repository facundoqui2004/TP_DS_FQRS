// src/api/evidencias.js
import { api } from './client';

// Crear evidencia
export const createEvidenciaRequest = (data) => api.post('/evidencias', data);

// Eliminar evidencia
export const deleteEvidenciaRequest = (id) => api.delete(`/evidencias/${id}`);

// Obtener una evidencia
export const getEvidenciaByIdRequest = (id) => api.get(`/evidencias/${id}`);

// Obtener todas
export const getAllEvidenciasRequest = () => api.get('/evidencias');
