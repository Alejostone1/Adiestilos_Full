import axios from './axiosConfig';

/**
 * API para gestión de Movimientos de Inventario
 */

const MOVIMIENTOS_ENDPOINT = '/movimientos';

/**
 * Obtiene movimientos de inventario con filtros y paginación
 * @param {object} params - Parámetros de consulta
 * @returns {Promise} Lista de movimientos
 */
export const obtenerMovimientos = async (params = {}) => {
  try {
    const response = await axios.get(MOVIMIENTOS_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    throw error;
  }
};

/**
 * Obtiene un movimiento específico por ID
 * @param {number} idMovimiento - ID del movimiento
 * @returns {Promise} Movimiento encontrado
 */
export const obtenerMovimientoPorId = async (idMovimiento) => {
  try {
    const response = await axios.get(`${MOVIMIENTOS_ENDPOINT}/${idMovimiento}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo movimiento:', error);
    throw error;
  }
};