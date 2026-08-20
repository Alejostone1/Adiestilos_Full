/**
 * Configuración de Cloudinary.
 *
 * Cloudinary se usa en producción como almacenamiento de imágenes.
 * Si las variables de entorno CLOUDINARY_* no están definidas, el sistema
 * sigue funcionando en modo local guardando en /uploads (desarrollo).
 *
 * Variables requeridas (de Cloudinary Dashboard -> Settings -> Access Keys):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 * Opcional:
 *   CLOUDINARY_FOLDER  (carpeta base dentro de tu cuenta, ej: adi-estilos)
 */

const cloudinary = require('cloudinary').v2;

const configuracionCloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  carpetaBase: process.env.CLOUDINARY_FOLDER || 'adi-estilos',
};

let inicializado = false;

/**
 * Configura el SDK de Cloudinary si las credenciales existen.
 * @returns {boolean} true si Cloudinary quedó listo para usarse.
 */
function inicializarCloudinary() {
  if (inicializado) return true;

  if (!configuracionCloudinary.cloudName || !configuracionCloudinary.apiKey || !configuracionCloudinary.apiSecret) {
    if (!inicializado && process.env.NODE_ENV !== 'production') {
      console.warn('[cloudinary] ⚠️  CLOUDINARY_* no configurado. Las subidas se guardarán en /uploads (modo local).');
    }
    inicializado = false;
    return false;
  }

  cloudinary.config({
    cloud_name: configuracionCloudinary.cloudName,
    api_key: configuracionCloudinary.apiKey,
    api_secret: configuracionCloudinary.apiSecret,
    secure: true,
  });

  inicializado = true;
  console.log('[cloudinary] ✅ Cloudinary configurado correctamente.');
  return true;
}

/**
 * Indica si el almacenamiento remoto está disponible.
 * @returns {boolean}
 */
function estaConfigurado() {
  return inicializarCloudinary();
}

function obtenerCarpetaBase() {
  return configuracionCloudinary.carpetaBase;
}

module.exports = {
  cloudinary,
  configuracionCloudinary,
  inicializarCloudinary,
  estaConfigurado,
  obtenerCarpetaBase,
};