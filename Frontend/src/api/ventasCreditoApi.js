import apiClient from './axiosConfig';

export const ventasCreditoApi = {
  /**
   * Obtiene el listado de créditos paginado con filtros.
   */
  getCreditos: async (filtros = {}) => {
    const { data } = await apiClient.get('/ventas-credito', { params: filtros });
    return data;
  },

  /**
   * Registra un abono a un crédito específico.
   * @param {number} idVenta - ID de la venta/crédito
   * @param {object} datosAbono - { monto, idMetodoPago, notas }
   */
  abonarCredito: async (idVenta, datosAbono) => {
    const { data } = await apiClient.post(`/ventas-credito/${idVenta}/abono`, datosAbono);
    return data;
  }
};
