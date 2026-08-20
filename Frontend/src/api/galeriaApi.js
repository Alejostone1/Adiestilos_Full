import apiClient from './axiosConfig';

export const galeriaApi = {
  obtenerResumen: async () => {
    try {
      const response = await apiClient.get('/galeria/resumen');
        // Handle various response structures for robust integration
        if (response.data && response.data.datos) {
            return response.data.datos;
         } else if (response.data) {
             return response.data;
        } else if (response.datos) {
            return response.datos;
        }
        return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  obtenerProductos: async (params = {}) => {
    try {
      const response = await apiClient.get('/galeria/productos', { params });
       if (response.data && response.data.datos) {
            return response.data;
         } else if (response.data) {
             return response.data;
        } else if (response.datos) {
            return response; // If wrapper has datos/paginacion at root
        }
        return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  listarProductosGaleria: async (params = {}) => {
    return galeriaApi.obtenerProductos(params);
  },

  obtenerVariantes: async (params = {}) => {
    try {
      const response = await apiClient.get('/galeria/variantes', { params });
       if (response.data && response.data.datos) {
            return response.data;
         } else if (response.data) {
             return response.data;
        } else if (response.datos) {
            return response;
        }
        return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  obtenerProveedores: async () => {
    try {
      const response = await apiClient.get('/galeria/proveedores');
       if (response.data && response.data.datos) {
            return response.data;
         } else if (response.data) {
             return response.data;
        } else if (response.datos) {
            return response;
        }
        return response;
    } catch (error) {
       throw error.response?.data || error;
    }
  },

  obtenerCategorias: async () => {
    try {
      const response = await apiClient.get('/galeria/categorias');
       if (response.data && response.data.datos) {
            return response.data;
         } else if (response.data) {
             return response.data;
        } else if (response.datos) {
            return response;
        }
        return response;
    } catch (error) {
       throw error.response?.data || error;
    }
  }
};
