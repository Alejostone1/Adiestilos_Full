import apiClient from './axiosConfig';

const getTallas = async () => {
  try {
    const response = await apiClient.get('/tallas');
    return response.data;
  } catch (error) {
    console.error('Error en getTallas:', error);
    
    // Manejo mejorado de errores
    if (error.response?.data) {
      // Error del backend con estructura estandarizada
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener tallas',
        codigo: backendError.codigo || 'GET_TALLAS_ERROR',
        statusCode: error.response.status,
        errores: backendError.errores || null
      };
    } else if (error.request) {
      // Error de red o sin respuesta del servidor
      throw {
        mensaje: 'No se pudo conectar al servidor. Verifique su conexión.',
        codigo: 'NETWORK_ERROR',
        statusCode: 0
      };
    } else {
      // Error inesperado
      throw {
        mensaje: error.message || 'Error inesperado al obtener tallas',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const getTallaById = async (id) => {
  try {
    const response = await apiClient.get(`/tallas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en getTallaById:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener la talla',
        codigo: backendError.codigo || 'GET_TALLA_ERROR',
        statusCode: error.response.status,
        errores: backendError.errores || null
      };
    } else if (error.request) {
      throw {
        mensaje: 'No se pudo conectar al servidor. Verifique su conexión.',
        codigo: 'NETWORK_ERROR',
        statusCode: 0
      };
    } else {
      throw {
        mensaje: error.message || 'Error inesperado al obtener la talla',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
}; 
  
const createTalla = async (tallaData) => {
  try {
    const response = await apiClient.post('/tallas', tallaData);
    return response.data;
  } catch (error) {
    console.error('Error en createTalla:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al crear la talla',
        codigo: backendError.codigo || 'CREATE_TALLA_ERROR',
        statusCode: error.response.status,
        errores: backendError.errores || null
      };
    } else if (error.request) {
      throw {
        mensaje: 'No se pudo conectar al servidor. Verifique su conexión.',
        codigo: 'NETWORK_ERROR',
        statusCode: 0
      };
    } else {
      throw {
        mensaje: error.message || 'Error inesperado al crear la talla',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const updateTalla = async (id, tallaData) => {
  try {
    const response = await apiClient.put(`/tallas/${id}`, tallaData);
    return response.data;
  } catch (error) {
    console.error('Error en updateTalla:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al actualizar la talla',
        codigo: backendError.codigo || 'UPDATE_TALLA_ERROR',
        statusCode: error.response.status,
        errores: backendError.errores || null
      };
    } else if (error.request) {
      throw {
        mensaje: 'No se pudo conectar al servidor. Verifique su conexión.',
        codigo: 'NETWORK_ERROR',
        statusCode: 0
      };
    } else {
      throw {
        mensaje: error.message || 'Error inesperado al actualizar la talla',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const deleteTalla = async (id) => {
  try {
    const response = await apiClient.delete(`/tallas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteTalla:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al eliminar la talla',
        codigo: backendError.codigo || 'DELETE_TALLA_ERROR',
        statusCode: error.response.status,
        errores: backendError.errores || null
      };
    } else if (error.request) {
      throw {
        mensaje: 'No se pudo conectar al servidor. Verifique su conexión.',
        codigo: 'NETWORK_ERROR',
        statusCode: 0
      };
    } else {
      throw {
        mensaje: error.message || 'Error inesperado al eliminar la talla',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};


export const tallasApi = {
    getTallas,
    getTallaById,
    createTalla,
    updateTalla,
    deleteTalla,
};
