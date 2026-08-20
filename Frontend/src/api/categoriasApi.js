import apiClient from './axiosConfig';

const obtenerTodasLasCategorias  = async () => {
  try {
    const response = await apiClient.get('/categorias');
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const getCategoriaById = async (id) => {
    try {
      const response = await apiClient.get(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
  };

const createCategoria = async (categoriaData) => {
    try {
        const response = await apiClient.post('/categorias', categoriaData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const updateCategoria = async (id, categoriaData) => {
    try {
        const response = await apiClient.put(`/categorias/${id}`, categoriaData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const deleteCategoria = async (id) => {
    try {
        const response = await apiClient.delete(`/categorias/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const uploadImagenCategoria = async (imagenFile) => {
    try {
        const formData = new FormData();
        formData.append('imagen', imagenFile);

        const response = await apiClient.post('/categorias/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};


export const categoriasApi = {
    obtenerTodasLasCategorias ,
    getCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    uploadImagenCategoria,
};
