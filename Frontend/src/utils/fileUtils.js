// Frontend/src/utils/fileUtils.js

import { getImagenURL } from './imageUrl';

/**
 * Construye la URL completa para un archivo (imagen, etc.).
 * @param {string} pathFromServer - La ruta del archivo tal como viene de la base de datos (ej: /uploads/productos/...).
 * @returns {string|null} La URL completa del archivo, o null si la ruta es inválida.
 */
export const getFileUrl = (pathFromServer) => {
  if (!pathFromServer) {
    return null; // O una imagen de fallback
  }
  return getImagenURL(pathFromServer);
};