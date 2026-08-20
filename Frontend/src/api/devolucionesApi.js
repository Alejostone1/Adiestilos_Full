import apiClient from './axiosConfig';

/**
 * Crea una nueva devolución
 * @param {object} devolucionData - Datos de la devolución a crear
 * @returns {Promise<object>} Devolución creada
 */
const createDevolucion = async (devolucionData) => {
    try {
        const response = await apiClient.post('/devoluciones', devolucionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Obtiene lista de devoluciones con paginación y filtros
 * @param {object} params - Parámetros de consulta (pagina, limite, filtros)
 * @returns {Promise<object>} Lista de devoluciones y paginación
 */
const getDevoluciones = async (params = {}) => {
    try {
        const response = await apiClient.get('/devoluciones', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Obtiene una devolución específica por su ID
 * @param {number} id - ID de la devolución
 * @returns {Promise<object>} Devolución encontrada
 */
const getDevolucionById = async (id) => {
    try {
        const response = await apiClient.get(`/devoluciones/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Actualiza una devolución existente
 * @param {number} id - ID de la devolución a actualizar
 * @param {object} data - Datos a actualizar
 * @returns {Promise<object>} Devolución actualizada
 */
const updateDevolucion = async (id, data) => {
    try {
        const response = await apiClient.put(`/devoluciones/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Cambia el estado de una devolución
 * @param {number} id - ID de la devolución
 * @param {string} estado - Nuevo estado ('pendiente', 'aprobada', 'rechazada', 'procesada')
 * @returns {Promise<object>} Devolución con estado actualizado
 */
const cambiarEstadoDevolucion = async (id, estado) => {
    try {
        const response = await apiClient.patch(`/devoluciones/${id}/estado`, { estado });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Elimina una devolución
 * @param {number} id - ID de la devolución a eliminar
 * @returns {Promise<void>}
 */
const deleteDevolucion = async (id) => {
    try {
        await apiClient.delete(`/devoluciones/${id}`);
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const devolucionesApi = {
    createDevolucion,
    getDevoluciones,
    getDevolucionById,
    updateDevolucion,
    cambiarEstadoDevolucion,
    deleteDevolucion,
};
