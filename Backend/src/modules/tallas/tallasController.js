
/**
 * @file tallasController.js
 * @brief Controlador para las solicitudes HTTP del módulo de Tallas.
 *
 * Este archivo gestiona las peticiones entrantes para el recurso de tallas,
 * validando la entrada, invocando las funciones del servicio correspondientes
 * y formateando la respuesta para el cliente.
 */

// Importaciones de módulos y utilidades
const tallasService = require('./tallasService');
const { sendSuccess } = require('../../utils/responseHelper');
const { handleHttpError } = require('../../utils/errorHelper');

/**
 * @function listarTallas
 * @brief Maneja la solicitud para obtener una lista de todas las tallas.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Obtiene todas las tallas a través del servicio y las envía
 * como una respuesta JSON exitosa.
 */
const listarTallas = async (req, res, next) => {
  try {
    const tallas = await tallasService.obtenerTodasLasTallas();
    sendSuccess(res, tallas, 'Tallas listadas exitosamente.');
  } catch (error) {
    next(error); // Pasar el error al middleware de manejo de errores
  }
};

/**
 * @function obtenerTallaPorId
 * @brief Maneja la solicitud para obtener una talla por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Recupera el ID de los parámetros de la ruta, lo valida,
 * busca la talla y la devuelve si existe; de lo contrario, envía un error 404.
 */
const obtenerTallaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return handleHttpError(res, 'El ID proporcionado no es un número válido.', 400);
    }

    const talla = await tallasService.obtenerTallaPorId(Number(id));
    if (!talla) {
      return handleHttpError(res, 'Talla no encontrada.', 404);
    }
    sendSuccess(res, talla, 'Talla obtenida exitosamente.');
  } catch (error) {
    next(error);
  }
};

/**
 * @function crearTalla
 * @brief Maneja la solicitud para crear una nueva talla.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Valida que el nombre de la talla esté presente, la crea usando
 * el servicio y devuelve la talla creada. Maneja errores de validación y de
 * unicidad (nombre de talla duplicado).
 */
const crearTalla = async (req, res, next) => {
  try {
    const datosTalla = req.body;
    if (!datosTalla.nombreTalla) {
      return handleHttpError(res, 'El campo "nombreTalla" es obligatorio.', 400);
    }

    const nuevaTalla = await tallasService.crearTalla(datosTalla);
    sendSuccess(res, nuevaTalla, 'Talla creada exitosamente.', 201);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('nombreTalla')) {
      return handleHttpError(res, 'Ya existe una talla con ese nombre.', 409);
    }
    next(error);
  }
};

/**
 * @function actualizarTalla
 * @brief Maneja la solicitud para actualizar una talla existente.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Actualiza una talla por su ID con los datos proporcionados.
 * Maneja errores si la talla no se encuentra o si los nuevos datos entran
 * en conflicto con una restricción de unicidad.
 */
const actualizarTalla = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    if (isNaN(id)) {
      return handleHttpError(res, 'El ID proporcionado no es un número válido.', 400);
    }

    const tallaActualizada = await tallasService.actualizarTalla(Number(id), datosActualizacion);
    sendSuccess(res, tallaActualizada, 'Talla actualizada exitosamente.');
  } catch (error) {
    if (error.code === 'P2025') {
      return handleHttpError(res, 'Talla no encontrada para actualizar.', 404);
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('nombreTalla')) {
      return handleHttpError(res, 'Ya existe otra talla con ese nombre.', 409);
    }
    next(error);
  }
};

/**
 * @function eliminarTalla
 * @brief Maneja la solicitud para desactivar una talla (borrado lógico).
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Realiza un borrado lógico cambiando el estado de la talla a 'inactivo'.
 * Maneja el error si la talla a desactivar no existe.
 */
const eliminarTalla = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return handleHttpError(res, 'El ID proporcionado no es un número válido.', 400);
    }

    await tallasService.eliminarTalla(Number(id));
    sendSuccess(res, null, 'Talla desactivada exitosamente.');
  } catch (error) {
    if (error.code === 'P2025') {
      return handleHttpError(res, 'Talla no encontrada para eliminar.', 404);
    }
    next(error);
  }
};

// Exportar los manejadores del controlador
module.exports = {
  listarTallas,
  obtenerTallaPorId,
  crearTalla,
  actualizarTalla,
  eliminarTalla,
};
