import axios from './axiosConfig';

/**
 * API para gestión de Ajustes de Inventario
 */

const AJUSTES_ENDPOINT = '/ajustes-inventario';

/**
 * Crea un ajuste de inventario en estado borrador
 * @param {object} ajuste - Datos del ajuste
 * @returns {Promise} Ajuste creado
 */
export const crearAjusteBorrador = async (ajuste) => {
  try {
    const response = await axios.post(`${AJUSTES_ENDPOINT}/borrador`, ajuste);
    return response.data;
  } catch (error) {
    console.error('Error creando ajuste borrador:', error);
    throw error;
  }
};

/**
 * Aplica un ajuste de inventario
 * @param {number} idAjuste - ID del ajuste
 * @returns {Promise} Ajuste aplicado
 */
export const aplicarAjuste = async (idAjuste) => {
  try {
    const response = await axios.patch(`${AJUSTES_ENDPOINT}/${idAjuste}/aplicar`);
    return response.data;
  } catch (error) {
    console.error('Error aplicando ajuste:', error);
    throw error;
  }
};

/**
 * Cancela un ajuste de inventario
 * @param {number} idAjuste - ID del ajuste
 * @returns {Promise} Ajuste cancelado
 */
export const cancelarAjuste = async (idAjuste) => {
  try {
    const response = await axios.patch(`${AJUSTES_ENDPOINT}/${idAjuste}/cancelar`);
    return response.data;
  } catch (error) {
    console.error('Error cancelando ajuste:', error);
    throw error;
  }
};

/**
 * Obtiene ajustes de inventario con filtros y paginación
 * @param {object} params - Parámetros de consulta
 * @returns {Promise} Lista de ajustes
 */
export const obtenerAjustes = async (params = {}) => {
  try {
    const response = await axios.get(AJUSTES_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ajustes:', error);
    throw error;
  }
};

/**
 * Obtiene un ajuste específico por ID
 * @param {number} idAjuste - ID del ajuste
 * @returns {Promise} Ajuste encontrado
 */
export const obtenerAjustePorId = async (idAjuste) => {
  try {
    const response = await axios.get(`${AJUSTES_ENDPOINT}/${idAjuste}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ajuste:', error);
    throw error;
  }
};
