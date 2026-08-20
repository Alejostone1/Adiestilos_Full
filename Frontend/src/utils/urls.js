// ===============================
// URLs globales del Frontend
// ===============================

import { getImagenURL } from './imageUrl';

export const API_URL = import.meta.env.VITE_API_URL;
export const FILES_URL = import.meta.env.VITE_FILES_URL;

/**
 * Genera la URL completa para una imagen almacenada en uploads
 * @param {string} path - Ruta de la imagen en el servidor
 * @returns {string} URL completa de la imagen
 */
export function getImageUrl(path) {
  return getImagenURL(path);
}