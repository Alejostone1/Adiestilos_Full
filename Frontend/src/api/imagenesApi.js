import apiClient from './axiosConfig';

const getImagenesProducto = async (idProducto) => {
  try {
    const response = await apiClient.get(`/imagenes/producto/${idProducto}`);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const createImagenProducto = async (idProducto, formData, options = {}) => {
  try {
    const response = await apiClient.post(`/imagenes/producto/${idProducto}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options
    });
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const deleteImagenProducto = async (idImagen) => {
  try {
    const response = await apiClient.delete(`/imagenes/producto/${idImagen}`);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const setImagenPrincipal = async (idImagen) => {
  try {
    const response = await apiClient.post(`/imagenes/producto/${idImagen}/principal`);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

// Funciones para imágenes de variantes
const getImagenesVariante = async (idVariante) => {
  try {
    const response = await apiClient.get(`/imagenes/variante/${idVariante}`);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const createImagenVariante = async (idVariante, formData, options = {}) => {
  try {
    const response = await apiClient.post(`/imagenes/variante/${idVariante}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options
    });
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const deleteImagenVariante = async (idImagen) => {
  try {
    const response = await apiClient.delete(`/imagenes/variante/${idImagen}`);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const setImagenPrincipalVariante = async (idImagen) => {
  try {
    const response = await apiClient.post(`/imagenes/variante/${idImagen}/principal`);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

const updateDatosImagenVariante = async (idImagen, datos) => {
  try {
    const response = await apiClient.put(`/imagenes/variante/${idImagen}`, datos);
    return response.data;
  } catch (error) {
    throw error.response.data || error;
  }
};

export const imagenesApi = {
  getImagenesProducto,
  createImagenProducto,
  deleteImagenProducto,
  setImagenPrincipal,
  getImagenesVariante,
  createImagenVariante,
  deleteImagenVariante,
  setImagenPrincipalVariante,
  updateDatosImagenVariante,
};
