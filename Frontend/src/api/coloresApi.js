import apiClient from './axiosConfig';

const getColores = async () => {
  try {
    const response = await apiClient.get('/colores');
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const getColorById = async (id) => {
    try {
      const response = await apiClient.get(`/colores/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
  };
  
const createColor = async (colorData) => {
    try {
        const response = await apiClient.post('/colores', colorData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const updateColor = async (id, colorData) => {
    try {
        const response = await apiClient.put(`/colores/${id}`, colorData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const deleteColor = async (id) => {
    try {
        const response = await apiClient.delete(`/colores/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

export const coloresApi = {
    getColores,
    getColorById,
    createColor,
    updateColor,
    deleteColor,
};
