import apiClient from "./axiosConfig";

/**
 * API para la gestión de Métodos de Pago
 */
export const metodosPagoApi = {
  /**
   * Obtener todos los métodos de pago activos
   */
  obtenerTodos: async () => {
    const { data } = await apiClient.get("/metodos-pago");
    return data;
  },

  /**
   * Obtener todos los tipos de métodos de pago
   */
  obtenerTipos: async () => {
    const { data } = await apiClient.get("/metodos-pago/tipos");
    return data;
  },

  /**
   * Obtener un método por ID
   */
  obtenerPorId: async (id) => {
    const { data } = await apiClient.get(`/metodos-pago/${id}`);
    return data;
  },

  /**
   * Crear un nuevo método de pago
   */
  crear: async (datos) => {
    const { data } = await apiClient.post("/metodos-pago", datos);
    return data;
  },

  /**
   * Actualizar un método de pago existente
   */
  actualizar: async (id, datos) => {
    const { data } = await apiClient.put(`/metodos-pago/${id}`, datos);
    return data;
  },

  /**
   * Eliminar un método de pago (eliminación lógica)
   */
  eliminar: async (id) => {
    const { data } = await apiClient.delete(`/metodos-pago/${id}`);
    return data;
  },

  // Alias para compatibilidad con componentes previos
  getMetodosPago: async () => {
    const { data } = await apiClient.get("/metodos-pago");
    return data;
  }
};
