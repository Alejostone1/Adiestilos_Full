import apiClient from './axiosConfig';

const getUsuarios = async (params) => {
  try {
    const response = await apiClient.get('/usuarios', { params });
    return response.data;
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    
    // Manejo mejorado de errores
    if (error.response?.data) {
      // Error del backend con estructura estandarizada
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener usuarios',
        codigo: backendError.codigo || 'GET_USUARIOS_ERROR',
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
        mensaje: error.message || 'Error inesperado al obtener usuarios',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const getUsuarioById = async (id) => {
  try {
    const response = await apiClient.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en getUsuarioById:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener el usuario',
        codigo: backendError.codigo || 'GET_USUARIO_ERROR',
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
        mensaje: error.message || 'Error inesperado al obtener el usuario',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const createUsuario = async (usuarioData) => {
  try {
    const response = await apiClient.post('/usuarios', usuarioData);
    return response.data;
  } catch (error) {
    console.error('Error en createUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al crear el usuario',
        codigo: backendError.codigo || 'CREATE_USUARIO_ERROR',
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
        mensaje: error.message || 'Error inesperado al crear el usuario',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const updateUsuario = async (id, usuarioData) => {
  try {
    const response = await apiClient.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al actualizar el usuario',
        codigo: backendError.codigo || 'UPDATE_USUARIO_ERROR',
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
        mensaje: error.message || 'Error inesperado al actualizar el usuario',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const deleteUsuario = async (id) => {
  try {
    const response = await apiClient.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al eliminar el usuario',
        codigo: backendError.codigo || 'DELETE_USUARIO_ERROR',
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
        mensaje: error.message || 'Error inesperado al eliminar el usuario',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const getMetricasUsuario = async (id) => {
  try {
    const response = await apiClient.get(`/usuarios/${id}/metricas`);
    return response.data;
  } catch (error) {
    console.error('Error en getMetricasUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener métricas del usuario',
        codigo: backendError.codigo || 'GET_METRICAS_ERROR',
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
        mensaje: error.message || 'Error inesperado al obtener métricas del usuario',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const getHistorialVentasUsuario = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/usuarios/${id}/ventas`, { params });
    return response.data;
  } catch (error) {
    console.error('Error en getHistorialVentasUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener historial de ventas',
        codigo: backendError.codigo || 'GET_HISTORIAL_VENTAS_ERROR',
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
        mensaje: error.message || 'Error inesperado al obtener historial de ventas',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const getHistorialCreditosUsuario = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/usuarios/${id}/creditos`, { params });
    return response.data;
  } catch (error) {
    console.error('Error en getHistorialCreditosUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al obtener historial de créditos',
        codigo: backendError.codigo || 'GET_HISTORIAL_CREDITOS_ERROR',
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
        mensaje: error.message || 'Error inesperado al obtener historial de créditos',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};

const changeEstadoUsuario = async (id, nuevoEstado) => {
  try {
    const response = await apiClient.patch(`/usuarios/${id}/estado`, { nuevoEstado });
    return response.data;
  } catch (error) {
    console.error('Error en changeEstadoUsuario:', error);
    
    if (error.response?.data) {
      const backendError = error.response.data;
      throw {
        mensaje: backendError.mensaje || 'Error al cambiar el estado del usuario',
        codigo: backendError.codigo || 'CHANGE_ESTADO_ERROR',
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
        mensaje: error.message || 'Error inesperado al cambiar el estado del usuario',
        codigo: 'UNKNOWN_ERROR',
        statusCode: 500
      };
    }
  }
};


export const usuariosApi = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  changeEstadoUsuario,
  getMetricasUsuario,
  getHistorialVentasUsuario,
  getHistorialCreditosUsuario,
};