import apiClient from './axiosConfig';

const comprasApi = {
  obtenerCompras: async (filtros) => {
    const response = await apiClient.get('/compras', { params: filtros });
    return response.data;
  },

  obtenerCompra: async (id) => {
    const response = await apiClient.get(`/compras/${id}`);
    return response.data;
  },

  crearCompra: async (compraData) => {
    const response = await apiClient.post('/compras', compraData);
    return response.data;
  },

  recibirCompra: async (id, datosRecepcion) => {
    const response = await apiClient.post(`/compras/${id}/recibir`, datosRecepcion);
    return response.data;
  },

  actualizarEstado: async (id, idEstadoPedido) => {
    const response = await apiClient.patch(`/compras/${id}/estado`, { idEstadoPedido });
    return response.data;
  },

  obtenerEstadosPedido: async () => {
    const response = await apiClient.get('/estados-pedido');
    return response.data;
  },
  
  // Helper to fetch products by provider for the selector
  // Assuming there is an endpoint or filter in products to get by provider
  // If not, we might need to rely on the general products endpoint with a filter
  obtenerProductosPorProveedor: async (idProveedor) => {
    const response = await apiClient.get(`/productos`, { params: { idProveedor, limite: 1000 } }); 
    return response.data;
  }
};

export default comprasApi;
