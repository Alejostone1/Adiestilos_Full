
/**
 * @file imagenesController.js
 * @brief Controlador para las solicitudes HTTP relacionadas con la gestión de imágenes.
 *
 * Este archivo maneja las peticiones para subir, eliminar, actualizar y listar
 * imágenes tanto de productos como de variantes, interactuando con el servicio de imágenes.
 */

const imagenesService = require('./imagenesService');
const { sendSuccess } = require('../../utils/responseHelper');
const { handleHttpError } = require('../../utils/errorHelper');

/**
 * @function subirImagen
 * @brief Manejador genérico para subir una imagen de producto o variante.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad a la que se asocia la imagen.
 */
const subirImagen = (tipo) => async (req, res) => {
  try {
    const idEntidadCampo = tipo === 'producto' ? 'idProducto' : 'idVariante';
    const idEntidad = req.params[idEntidadCampo];

    if (isNaN(idEntidad)) {
      return handleHttpError(res, `El ID de ${tipo} proporcionado no es un número válido.`, 400);
    }
    if (!req.file) {
      return handleHttpError(res, 'No se ha subido ningún archivo o el tipo de archivo no es válido.', 400);
    }

    const nuevaImagen = await imagenesService.crearImagen(Number(idEntidad), tipo, req.file, req.body);
    sendSuccess(res, nuevaImagen, 'Imagen subida y guardada exitosamente.', 201);
  } catch (error) {
    handleHttpError(res, `Error al subir la imagen de ${tipo}.`);
  }
};

/**
 * @function eliminarImagen
 * @brief Manejador genérico para eliminar una imagen.
 * @param {'producto' | 'variante'} tipo - El tipo de imagen a eliminar.
 */
const eliminarImagen = (tipo) => async (req, res) => {
  try {
    const { idImagen } = req.params;
    if (isNaN(idImagen)) {
      return handleHttpError(res, 'El ID de la imagen proporcionado no es un número válido.', 400);
    }
    await imagenesService.eliminarImagen(Number(idImagen), tipo);
    sendSuccess(res, null, 'Imagen eliminada exitosamente.');
  } catch (error) {
    if (error.statusCode === 404) {
      return handleHttpError(res, error.message, 404);
    }
    handleHttpError(res, `Error al eliminar la imagen de ${tipo}.`);
  }
};

/**
 * @function listarImagenes
 * @brief Manejador genérico para listar imágenes de un producto o variante.
 * @param {'producto' | 'variante'} tipo - El tipo de entidad.
 */
const listarImagenes = (tipo) => async (req, res) => {
    try {
        const idEntidadCampo = tipo === 'producto' ? 'idProducto' : 'idVariante';
        const idEntidad = req.params[idEntidadCampo];

        if (isNaN(idEntidad)) {
            return handleHttpError(res, `El ID de ${tipo} proporcionado no es un número válido.`, 400);
        }

        const imagenes = await imagenesService.obtenerImagenesPorEntidad(Number(idEntidad), tipo);
        sendSuccess(res, imagenes, `Imágenes de ${tipo} listadas exitosamente.`);
    } catch (error) {
        handleHttpError(res, `Error al listar las imágenes de ${tipo}.`);
    }
};

/**
 * @function actualizarDatosImagen
 * @brief Manejador para actualizar los metadatos de una imagen.
 * @param {'producto' | 'variante'} tipo - El tipo de imagen.
 */
const actualizarDatosImagen = (tipo) => async (req, res) => {
    try {
        const { idImagen } = req.params;
        if (isNaN(idImagen)) {
            return handleHttpError(res, 'El ID de la imagen no es válido.', 400);
        }
        const imagenActualizada = await imagenesService.actualizarDatosImagen(Number(idImagen), tipo, req.body);
        sendSuccess(res, imagenActualizada, 'Datos de la imagen actualizados.');
    } catch (error) {
        if (error.code === 'P2025') { // Error de Prisma para "registro no encontrado"
            return handleHttpError(res, 'Imagen no encontrada para actualizar.', 404);
        }
        handleHttpError(res, `Error al actualizar datos de la imagen de ${tipo}.`);
    }
}

/**
 * @function definirComoPrincipal
 * @brief Manejador para establecer una imagen como principal.
 * @param {'producto' | 'variante'} tipo - El tipo de imagen.
 */
const definirComoPrincipal = (tipo) => async (req, res) => {
    try {
        const { idImagen } = req.params;
        if (isNaN(idImagen)) {
            return handleHttpError(res, 'El ID de la imagen no es válido.', 400);
        }
        const imagenPrincipal = await imagenesService.establecerImagenPrincipal(Number(idImagen), tipo);
        sendSuccess(res, imagenPrincipal, 'La imagen ha sido establecida como principal.');
    } catch (error) {
        if (error.statusCode === 404) {
            return handleHttpError(res, error.message, 404);
        }
        handleHttpError(res, `Error al establecer la imagen principal para ${tipo}.`);
    }
};

// Exportar controladores específicos para producto y variante
module.exports = {
  subirImagenProducto: subirImagen('producto'),
  subirImagenVariante: subirImagen('variante'),
  eliminarImagenProducto: eliminarImagen('producto'),
  eliminarImagenVariante: eliminarImagen('variante'),
  listarImagenesProducto: listarImagenes('producto'),
  listarImagenesVariante: listarImagenes('variante'),
  actualizarDatosImagenProducto: actualizarDatosImagen('producto'),
  actualizarDatosImagenVariante: actualizarDatosImagen('variante'),
  definirPrincipalProducto: definirComoPrincipal('producto'),
  definirPrincipalVariante: definirComoPrincipal('variante'),
};
