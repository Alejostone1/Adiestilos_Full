import apiClient from './axiosConfig';

const getVentas = async (params = {}) => {
  try {
    const response = await apiClient.get('/ventas', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const getVentaById = async (id) => {
  try {
    const response = await apiClient.get(`/ventas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const createVenta = async (ventaData) => {
  try {
    const response = await apiClient.post('/ventas', ventaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const updateVenta = async (id, ventaData) => {
  try {
    const response = await apiClient.put(`/ventas/${id}`, ventaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const actualizarEstado = async (id, idEstadoPedido) => {
  try {
    const response = await apiClient.patch(`/ventas/${id}/estado`, { idEstadoPedido });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const ventasApi = {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  actualizarEstado,
};
