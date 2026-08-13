// src/api/multas.js
import { api } from './client';

// Crear multa
export const createMultaRequest = (data) => api.post('/multas', data);

// Obtener todas
export const getAllMultasRequest = () => api.get('/multas');

// Obtener una
export const getMultaByIdRequest = (id) => api.get(`/multas/${id}`);

// Eliminar
export const deleteMultaRequest = (id) => api.delete(`/multas/${id}`);

export const updateMultaRequest = (id, data) => api.put(`/multas/${id}`, data);

export const pagarMultaRequest = (id, data) => api.post(`/multas/${id}/pagar`, data);

export const crearPreferenciaMPRequest = (id) => api.post(`/multas/${id}/crear-preferencia-mp`);
