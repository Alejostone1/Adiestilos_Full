import axios from './axiosConfig';

/**
 * API para gestión del Dashboard Administrativo
 */

const DASHBOARD_ENDPOINT = '/reportes/dashboard';
const VENTAS_ENDPOINT = '/reportes/ventas';
const INVENTARIO_ENDPOINT = '/reportes/inventario';
const CREDITOS_ENDPOINT = '/reportes/creditos';

/**
 * Obtiene el resumen general del dashboard
 * @param {string} rango - Rango de tiempo ('dia', 'semana', 'mes')
 * @returns {Promise} Resumen del dashboard
 */
export const obtenerResumenDashboard = async (rango = 'dia') => {
  try {
    const response = await axios.get(DASHBOARD_ENDPOINT, {
      params: { rango }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo resumen del dashboard:', error);
    throw error;
  }
};

/**
 * Obtiene reporte de ventas detallado
 * @param {object} params - Parámetros del reporte
 * @returns {Promise} Reporte de ventas
 */
export const obtenerReporteVentas = async (params = {}) => {
  try {
    const response = await axios.get(VENTAS_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo reporte de ventas:', error);
    throw error;
  }
};

/**
 * Obtiene reporte de inventario
 * @param {string} tipoReporte - Tipo de reporte ('valoracion', 'stock_bajo', 'movimientos_recientes')
 * @returns {Promise} Reporte de inventario
 */
export const obtenerReporteInventario = async (tipoReporte = 'valoracion') => {
  try {
    const response = await axios.get(INVENTARIO_ENDPOINT, {
      params: { tipoReporte }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo reporte de inventario:', error);
    throw error;
  }
};

/**
 * Obtiene reporte de créditos
 * @param {string} estado - Estado de los créditos (opcional)
 * @returns {Promise} Reporte de créditos
 */
export const obtenerReporteCreditos = async (estado = null) => {
  try {
    const params = estado ? { estado } : {};
    const response = await axios.get(CREDITOS_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo reporte de créditos:', error);
    throw error;
  }
};