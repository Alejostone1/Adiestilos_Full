/**
 * @file authApi.js
 * @brief Funciones para interactuar con los endpoints de autenticación de la API.
 */

import apiClient from './axiosConfig';

/**
 * Envía las credenciales del usuario al backend para iniciar sesión.
 * @param {object} credenciales - Objeto con { correoElectronico, contrasena }.
 * @returns {Promise<object>} La respuesta del servidor, que incluye el usuario y el token.
 */
export const loginUsuario = async (credenciales) => {
  try {
    const respuesta = await apiClient.post('/auth/login', credenciales);
    return respuesta.data;
  } catch (error) {
    // Re-lanzar el error para que el componente que llama pueda manejarlo (ej. mostrar un mensaje).
    // El error es procesado por el interceptor de Axios si es necesario.
    throw error.response.data || error;
  }
};

/**
 * Envía los datos de un nuevo usuario al backend para el registro.
 * @param {object} datosUsuario - Objeto con los datos del nuevo usuario.
 * @returns {Promise<object>} La respuesta del servidor con el usuario creado.
 */
export const registrarUsuario = async (datosUsuario) => {
  try {
    const respuesta = await apiClient.post('/auth/registro', datosUsuario);
    return respuesta.data;
  } catch (error) {
    throw error.response.data || error;
  }
};
