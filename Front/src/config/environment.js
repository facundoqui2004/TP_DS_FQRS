// Configuración centralizada de ambientes del Frontend
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  appTitle: import.meta.env.VITE_APP_TITLE || 'El Súper Gestor',
  env: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  isProduction: () => (import.meta.env.MODE === 'production' || import.meta.env.VITE_APP_ENV === 'production'),
  isDevelopment: () => (import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development'),
  isTest: () => (import.meta.env.MODE === 'test' || import.meta.env.VITE_APP_ENV === 'test'),
};

export default config;
