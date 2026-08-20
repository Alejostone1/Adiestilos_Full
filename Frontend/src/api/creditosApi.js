import apiClient from './axiosConfig';

const getCreditos = async (params) => {
  try {
    const response = await apiClient.get('/creditos', { params });
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const getCreditosByCliente = async (idUsuario) => {
    try {
      const response = await apiClient.get(`/creditos/cliente/${idUsuario}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
};

const getCreditoById = async (id) => {
    try {
      const response = await apiClient.get(`/creditos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
};

const agregarAbono = async (id, abonoData) => {
    try {
        const response = await apiClient.post(`/creditos/${id}/abonos`, abonoData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

export const creditosApi = {
    getCreditos,
    getCreditosByCliente,
    getCreditoById,
    agregarAbono,
};
