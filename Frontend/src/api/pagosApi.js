import apiClient from './axiosConfig';

const getPagos = async () => {
  try {
    const response = await apiClient.get('/pagos');
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const getPagoById = async (id) => {
    try {
      const response = await apiClient.get(`/pagos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
  };
  
const createPago = async (pagoData) => {
    try {
        const response = await apiClient.post('/pagos', pagoData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const updatePago = async (id, pagoData) => {
    try {
        const response = await apiClient.put(`/pagos/${id}`, pagoData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const deletePago = async (id) => {
    try {
        const response = await apiClient.delete(`/pagos/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};


export const pagosApi = {
    getPagos,
    getPagoById,
    createPago,
    updatePago,
    deletePago,
};
