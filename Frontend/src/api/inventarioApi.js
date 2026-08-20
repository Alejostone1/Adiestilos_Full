import axios from './axiosConfig';

/**
 * API para gestión del Inventario
 */

const INVENTARIO_ENDPOINT = '/inventario';

/**
 * Obtiene el stock actual con filtros y paginación
 * @param {object} params - Parámetros de consulta
 * @returns {Promise} Stock actual
 */
export const obtenerStockActual = async (params = {}) => {
  try {
    const response = await axios.get(`${INVENTARIO_ENDPOINT}/stock`, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo stock actual:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas del inventario
 * @returns {Promise} Estadísticas del inventario
 */
export const obtenerEstadisticasInventario = async () => {
  try {
    const response = await axios.get(`${INVENTARIO_ENDPOINT}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

/**
 * Obtiene el stock de una variante específica
 * @param {number} idVariante - ID de la variante
 * @returns {Promise} Stock de la variante
 */
export const obtenerStockVariante = async (idVariante) => {
  try {
    const response = await axios.get(`${INVENTARIO_ENDPOINT}/variante/${idVariante}/stock`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo stock de variante:', error);
    throw error;
  }
};
