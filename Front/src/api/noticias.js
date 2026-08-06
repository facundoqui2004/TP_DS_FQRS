// src/api/noticias.js
import { api } from './client';

// Obtener todas las noticias
export const getAllNoticiasRequest = () => api.get('/noticias');

// Obtener una noticia
export const getNoticiaByIdRequest = (id) => api.get(`/noticias/${id}`);

// Crear una noticia
export const createNoticiaRequest = (data) => api.post('/noticias', data);

// Actualizar una noticia (completa)
export const updateNoticiaRequest = (id, data) => api.put(`/noticias/${id}`, data);

// Actualizar parcialmente una noticia
export const patchNoticiaRequest = (id, data) => api.patch(`/noticias/${id}`, data);

// Eliminar una noticia
export const deleteNoticiaRequest = (id) => api.delete(`/noticias/${id}`);
