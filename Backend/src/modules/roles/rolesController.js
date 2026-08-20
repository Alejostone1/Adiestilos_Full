
/**
 * @file rolesController.js
 * @brief Controlador para las solicitudes HTTP del módulo de Roles.
 *
 * Este archivo gestiona las peticiones entrantes para el recurso de roles,
 * invocando las funciones del servicio correspondientes y manejando las
 * respuestas y errores de manera estandarizada.
 */

const rolesService = require('./rolesService');
const { LISTA_PERMISOS } = require('./rolesConstants');
const { sendSuccess } = require('../../utils/responseHelper');
const { handleHttpError, ErrorConflicto, ErrorNoEncontrado } = require('../../utils/errorHelper');

/**
 * @function listarRoles
 * @brief Maneja la solicitud para obtener una lista de todos los roles.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const listarRoles = async (req, res, next) => {
  try {
    const roles = await rolesService.obtenerTodosLosRoles();
    sendSuccess(res, roles, 'Roles listados exitosamente.');
  } catch (error) {
    next(error); // Pasa el error al manejador de errores global
  }
};

/**
 * @function obtenerRolPorId
 * @brief Maneja la solicitud para obtener un rol por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const obtenerRolPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rol = await rolesService.obtenerRolPorId(Number(id));
    if (!rol) {
      // Lanza un error específico que el middleware puede interpretar
      throw new ErrorNoEncontrado('Rol');
    }
    sendSuccess(res, rol, 'Rol obtenido exitosamente.');
  } catch (error) {
    next(error);
  }
};

/**
 * @function crearRol
 * @brief Maneja la solicitud para crear un nuevo rol.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const crearRol = async (req, res, next) => {
  try {
    const nuevoRol = await rolesService.crearRol(req.body);
    sendSuccess(res, nuevoRol, 'Rol creado exitosamente.', 201);
  } catch (error) {
    // Manejo de errores de Prisma (ej. restricción única violada)
    if (error.code === 'P2002' && error.meta?.target?.includes('nombreRol')) {
      return next(new ErrorConflicto('Ya existe un rol con ese nombre.'));
    }
    next(error);
  }
};

/**
 * @function actualizarRol
 * @brief Maneja la solicitud para actualizar un rol existente.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const actualizarRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rolActualizado = await rolesService.actualizarRol(Number(id), req.body);
    sendSuccess(res, rolActualizado, 'Rol actualizado exitosamente.');
  } catch (error) {
    if (error.code === 'P2025') { // Error de Prisma para "registro a actualizar no encontrado"
      return next(new ErrorNoEncontrado('Rol'));
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('nombreRol')) {
      return next(new ErrorConflicto('Ya existe un rol con ese nombre.'));
    }
    next(error);
  }
};

/**
 * @function eliminarRol
 * @brief Maneja la solicitud para eliminar un rol.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const eliminarRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    await rolesService.eliminarRol(Number(id));
    sendSuccess(res, null, 'Rol eliminado exitosamente.');
  } catch (error) {
    // Si el error es por no encontrar el rol o por conflicto (rol en uso),
    // el error personalizado ya está formateado y se pasa directamente.
    next(error);
  }
};

/**
 * @function cambiarEstadoRol
 * @brief Maneja la solicitud para activar o desactivar un rol.
 */
const cambiarEstadoRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ exito: false, mensaje: 'El campo activo debe ser booleano.' });
    }

    const rolActualizado = await rolesService.actualizarRol(Number(id), { activo });
    sendSuccess(res, rolActualizado, `Rol ${activo ? 'activado' : 'desactivado'} exitosamente.`);
  } catch (error) {
    next(error);
  }
};

/**
 * @function obtenerListaPermisos
 * @brief Retorna la lista de permisos disponibles que el sistema soporta.
 */
const obtenerListaPermisos = async (req, res, next) => {
  try {
    sendSuccess(res, LISTA_PERMISOS, 'Lista de permisos disponibles obtenida.');
  } catch (error) {
    next(error);
  }
};

// Exportar los manejadores del controlador
module.exports = {
  listarRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol,
  cambiarEstadoRol,
  obtenerListaPermisos
};
