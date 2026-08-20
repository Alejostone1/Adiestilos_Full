/**
 * Servicio de Cloudinary.
 *
 * Encapsula las operaciones de subida y borrado de imágenes.
 * Si Cloudinary no está configurado, las funciones devuelven/omiten el
 * comportamiento local para no romper el flujo en desarrollo.
 */

const fs = require('fs/promises');
const path = require('path');
const { cloudinary, estaConfigurado, obtenerCarpetaBase } = require('../config/cloudinaryConfig');

/**
 * Indica si una ruta/URL corresponde a un archivo hosteado en Cloudinary.
 * @param {string} ruta
 * @returns {boolean}
 */
function esUrlCloudinary(ruta) {
  return typeof ruta === 'string' && ruta.toLowerCase().includes('res.cloudinary.com');
}

/**
 * Extrae el public_id de una URL de Cloudinary.
 * Ejemplo: https://res.cloudinary.com/<cloud>/image/upload/v1234/adi-estilos/productos/prod_123.jpg
 *          -> 'adi-estilos/productos/prod_123'
 * @param {string} url
 * @returns {string|null}
 */
function extraerPublicIdDeUrl(url) {
  try {
    const sinQuery = url.split('?')[0];
    const match = sinQuery.match(/\/image\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Guarda una imagen proveniente de Multer.
 * - Con Cloudinary configurado: sube el archivo y devuelve la URL remota.
 * - Sin Cloudinary: devuelve la ruta relativa local (/uploads/<sub>/<archivo>).
 * @param {{ path: string, filename: string }} file - Archivo procesado por Multer.
 * @param {string} subdirectorio - Subdirectorio de destino (productos, variantes, categorias, proveedores...).
 * @returns {Promise<string>} URL o ruta pública de la imagen.
 */
async function guardarImagen(file, subdirectorio) {
  const carpeta = subdirectorio ? `${obtenerCarpetaBase()}/${subdirectorio}` : obtenerCarpetaBase();

  if (!estaConfigurado()) {
    return `/uploads/${subdirectorio}/${file.filename}`;
  }

  const publicId = path.basename(file.filename, path.extname(file.filename));

  const resultado = await cloudinary.uploader.upload(file.path, {
    folder: carpeta,
    public_id: publicId,
    resource_type: 'image',
    overwrite: true,
  });

  // La copia local temporal ya no es necesaria cuando se sube a Cloudinary.
  await fs.unlink(file.path).catch(() => {});

  return resultado.secure_url;
}

/**
 * Elimina una imagen desde Cloudinary si la ruta corresponde a una URL remota.
 * @param {string} ruta - URL de Cloudinary o ruta local.
 * @returns {Promise<boolean>} true si se eliminó remotamente.
 */
async function borrarImagen(ruta) {
  if (!estaConfigurado() || !esUrlCloudinary(ruta)) return false;

  const publicId = extraerPublicIdDeUrl(ruta);
  if (!publicId) return false;

  const resultado = await cloudinary.uploader.destroy(publicId);
  return Boolean(resultado && resultado.result === 'ok');
}

module.exports = {
  esUrlCloudinary,
  guardarImagen,
  borrarImagen,
};