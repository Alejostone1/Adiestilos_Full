import apiClient from './axiosConfig';

const obtenerProductos = async (params = {}) => {
  try {
    const response = await apiClient.get('/productos', { params });
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const getProductoById = async (id) => {
    try {
      const response = await apiClient.get(`/productos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
  };

const createProducto = async (productoData) => {
    try {
        const response = await apiClient.post('/productos', productoData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const updateProducto = async (id, productoData) => {
    try {
        const response = await apiClient.put(`/productos/${id}`, productoData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const deleteProducto = async (id) => {
    try {
        const response = await apiClient.delete(`/productos/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const uploadImagenProducto = async (formData) => {
    try {
        const response = await apiClient.post('/productos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};


export const productosApi = {
    obtenerProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    uploadImagenProducto,
};
