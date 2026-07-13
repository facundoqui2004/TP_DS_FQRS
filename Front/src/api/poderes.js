// src/api/poderes.js
import { api } from './client';

// Obtener todos los poderes
export const getPoderes = async () => {
  const res = await api.get('/poderes');
  return res.data;
};

// Obtener poder x ID
export const getPoderById = async (id) => {
  const res = await api.get(`/poderes/${id}`);
  return res.data;
};

// Crear poder
export const createPoder = async (poderData) => {
  const res = await api.post('/poderes', poderData);
  return res.data;
};

// Actualizar poder
export const updatePoder = async (id, poderData) => {
  const res = await api.put(`/poderes/${id}`, poderData);
  return res.data;
};

// Eliminar poder
export const deletePoder = async (id) => {
  const res = await api.delete(`/poderes/${id}`);
  return res.data;
};
