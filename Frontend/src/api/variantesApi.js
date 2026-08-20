import apiClient from './axiosConfig';

const getVariantes = async () => {
  try {
    const response = await apiClient.get('/variantes');
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const getVarianteById = async (id) => {
    try {
      const response = await apiClient.get(`/variantes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
  };
  
const createVariante = async (varianteData) => {
    try {
        const response = await apiClient.post('/variantes', varianteData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const updateVariante = async (id, varianteData) => {
    try {
        const response = await apiClient.put(`/variantes/${id}`, varianteData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const deleteVariante = async (id) => {
    try {
        const response = await apiClient.delete(`/variantes/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const getVariantesPorProducto = async (idProducto) => {
    try {
        const response = await apiClient.get(`/variantes/producto/${idProducto}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};


export const variantesApi = {
    getVariantes,
    getVarianteById,
    createVariante,
    updateVariante,
    deleteVariante,
    getVariantesPorProducto,
};
