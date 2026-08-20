import axios from './axiosConfig';

/**
 * API para gestión de Tipos de Movimiento
 */

const TIPOS_MOVIMIENTO_ENDPOINT = '/tipos-movimiento';

/**
 * Crea un nuevo tipo de movimiento
 * @param {object} tipoMovimiento - Datos del tipo de movimiento
 * @returns {Promise} Tipo de movimiento creado
 */
export const crearTipoMovimiento = async (tipoMovimiento) => {
  try {
    const response = await axios.post(TIPOS_MOVIMIENTO_ENDPOINT, tipoMovimiento);
    return response.data;
  } catch (error) {
    console.error('Error creando tipo de movimiento:', error);
    throw error;
  }
};

/**
 * Obtiene todos los tipos de movimiento con paginación y filtros
 * @param {object} params - Parámetros de consulta
 * @returns {Promise} Lista de tipos de movimiento
 */
export const obtenerTodosLosTiposMovimiento = async (params = {}) => {
  try {
    const response = await axios.get(TIPOS_MOVIMIENTO_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipos de movimiento:', error);
    throw error;
  }
};

/**
 * Obtiene un tipo de movimiento específico por ID
 * @param {number} idTipoMovimiento - ID del tipo de movimiento
 * @returns {Promise} Tipo de movimiento encontrado
 */
export const obtenerTipoMovimientoPorId = async (idTipoMovimiento) => {
  try {
    const response = await axios.get(`${TIPOS_MOVIMIENTO_ENDPOINT}/${idTipoMovimiento}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipo de movimiento:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de movimiento existente
 * @param {number} idTipoMovimiento - ID del tipo de movimiento
 * @param {object} tipoMovimiento - Datos actualizados
 * @returns {Promise} Tipo de movimiento actualizado
 */
export const actualizarTipoMovimiento = async (idTipoMovimiento, tipoMovimiento) => {
  try {
    const response = await axios.put(`${TIPOS_MOVIMIENTO_ENDPOINT}/${idTipoMovimiento}`, tipoMovimiento);
    return response.data;
  } catch (error) {
    console.error('Error actualizando tipo de movimiento:', error);
    throw error;
  }
};

/**
 * Desactiva un tipo de movimiento (borrado lógico)
 * @param {number} idTipoMovimiento - ID del tipo de movimiento
 * @returns {Promise} Tipo de movimiento desactivado
 */
export const desactivarTipoMovimiento = async (idTipoMovimiento) => {
  try {
    const response = await axios.patch(`${TIPOS_MOVIMIENTO_ENDPOINT}/${idTipoMovimiento}/desactivar`);
    return response.data;
  } catch (error) {
    console.error('Error desactivando tipo de movimiento:', error);
    throw error;
  }
};
