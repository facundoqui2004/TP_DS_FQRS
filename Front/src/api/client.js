// src/api/client.js
import axios from 'axios';
import { config as appConfig } from '../config/environment';

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
    if (status === 401) {

    }
    // console.error('Error', status, error.config?.url);
    return Promise.reject(error);
  }
);
