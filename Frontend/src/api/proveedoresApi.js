import apiClient from './axiosConfig';

const listarProveedores = async () => {
  try {
    const response = await apiClient.get('/proveedores');
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const obtenerProveedorById = async (id) => {
    try {
      const response = await apiClient.get(`/proveedores/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data || error;
    }
  };
  
const crearProveedor = async (proveedorData) => {
    try {
        const response = await apiClient.post('/proveedores', proveedorData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const actualizarProveedor = async (id, proveedorData) => {
    try {
        const response = await apiClient.put(`/proveedores/${id}`, proveedorData);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const eliminarProveedor = async (id) => {
    try {
        const response = await apiClient.delete(`/proveedores/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};

const subirImagenProveedor = async (imagenFile) => {
    try {
        const formData = new FormData();
        formData.append('imagen', imagenFile);
        
        const response = await apiClient.post('/proveedores/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data || error;
    }
};


export const proveedoresApi = {
    listarProveedores,
    obtenerProveedorById,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
    subirImagenProveedor,
};
