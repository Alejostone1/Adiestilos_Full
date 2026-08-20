/**
 * @file reportesApi.js
 * @brief Funciones para interactuar con los endpoints de reportes de la API.
 */

import apiClient from './axiosConfig';

/**
 * Obtiene los datos del dashboard desde el backend.
 * @returns {Promise<object>} La respuesta del servidor, que incluye las estadísticas del dashboard.
 */
export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/reportes/dashboard');
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};
