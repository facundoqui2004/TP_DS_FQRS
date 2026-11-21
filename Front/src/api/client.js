// src/api/client.js
import axios from 'axios';
import { config as appConfig } from '../config/environment';
import { getUserFromCookie, removeUserCookie } from '../utils/cookies';

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    // console.log('', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    // 401 = el servidor ya no reconoce la sesión (token vencido o inválido)
    const esLogin = error.config?.url?.includes('/auth/login');
    const teniaSesion = localStorage.getItem('user_info') !== null || getUserFromCookie() !== null;
    if (status === 401 && !esLogin && teniaSesion) {
      // Limpiar la sesión guardada en el navegador
      localStorage.removeItem('user_info');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      removeUserCookie();
      // Mandar al login avisando por qué (sin redirigir si ya estamos ahí, para no hacer un bucle)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?sesion=expirada';
      }
    }
    // console.error('Error', status, error.config?.url);
    return Promise.reject(error);
  }
);
