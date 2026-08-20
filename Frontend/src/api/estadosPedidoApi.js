import apiClient from './axiosConfig';

const getEstadosPedido = async () => {
  try {
    const response = await apiClient.get('/estados-pedido');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const estadosPedidoApi = {
  getEstadosPedido,
};
