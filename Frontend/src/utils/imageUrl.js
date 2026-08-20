// =============================================
// Helper central de URLs de imágenes
// Adi Estilos
//
// Soporta:
//  - URLs absolutas (https://res.cloudinary.com/... o cualquier http/https)
//  - Rutas relativas del backend (/uploads/productos/... o /uploads/nombre)
//  - Rutas "legacy" sin barra inicial (uploads/..., backend/uploads/...)
//
// En desarrollo, /uploads se resuelve por el proxy de Vite (vite.config.js).
// En producción, VITE_FILES_URL debe apuntar al origen del backend
// (Railway) o a un CDN/dominio que sirva esos archivos.
// =============================================

const FILES_BASE_URL = import.meta.env.VITE_FILES_URL || '';

/**
 * Construye la URL pública de una imagen.
 * @param {string} ruta - Ruta tal como viene de la base de datos o API.
 * @returns {string} URL completa (absoluta) o '' si no hay ruta válida.
 */
export function getImagenURL(ruta) {
  if (!ruta || typeof ruta !== 'string') return '';
  const url = ruta.trim();
  if (!url) return '';

  // URLs absolutas (Cloudinary, CDN, etc.) se devuelven tal cual.
  if (/^https?:\/\//i.test(url)) return url;

  // Normalizar separadores de Windows y prefijos 'backend/' heredados.
  let limpia = url.replace(/\\/g, '/');
  limpia = limpia.replace(/^\/?(backend\/)+/i, '');

  if (!limpia.startsWith('/')) limpia = `/${limpia}`;

  // Rutas que ya incluyen /uploads (o /uploads/...).
  if (limpia.startsWith('/uploads')) return `${FILES_BASE_URL}${limpia}`;

  // Cualquier otra ruta relativa se asume dentro de uploads.
  return `${FILES_BASE_URL}/uploads${limpia}`;
}

export default getImagenURL;