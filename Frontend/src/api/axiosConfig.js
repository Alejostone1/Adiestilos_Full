/**
 * @file axiosConfig.js
 * Configuración centralizada de Axios
 * Preparada para DEV y PRODUCCIÓN
 */

import axios from 'axios';

// ⚠️ VITE expone variables con import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado a 30 segundos
});

/**
 * Establecer o eliminar token JWT
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

/**
 * Interceptor global de errores
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo global de errores
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o no autorizada');
      // Aquí luego puedes forzar logout global
    }
    return Promise.reject(error);
  }
);

export default apiClient;
