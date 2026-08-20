/**
 * Controlador para Tipos de Movimiento.
 * Maneja las operaciones CRUD para tipos de movimiento de inventario.
 */

const { sendSuccess, respuestaError } = require('../../utils/responseHelper');
const {
  crearTipoMovimiento,
  obtenerTodosLosTiposMovimiento,
  obtenerTipoMovimientoPorId,
  actualizarTipoMovimiento,
  desactivarTipoMovimiento,
} = require('./tiposMovimientoService');

/**
 * Crear un nuevo tipo de movimiento.
 * Middleware requerido: authMiddleware, validationMiddleware
 */
async function crearTipoMovimientoController(req, res) {
  try {
    const { nombreTipo, tipo, afectaCosto, descripcion } = req.body;

    const nuevoTipo = await crearTipoMovimiento({
      nombreTipo,
      tipo,
      afectaCosto,
      descripcion,
    });

    sendSuccess(res, nuevoTipo, 'Tipo de movimiento creado exitosamente', 201);
  } catch (error) {
    console.error('Error en crearTipoMovimientoController:', error);
    res.status(400).json(respuestaError(error.message, 400));
  }
}

/**
 * Obtener lista de tipos de movimiento con paginación.
 * Middleware requerido: authMiddleware
 */
async function obtenerTiposMovimientoController(req, res) {
  try {
    const { pagina = 1, limite = 10 } = req.query;

    const resultado = await obtenerTodosLosTiposMovimiento({
      pagina: Number(pagina),
      limite: Number(limite),
    });

    sendSuccess(res, resultado, 'Tipos de movimiento obtenidos exitosamente');
  } catch (error) {
    console.error('Error en obtenerTiposMovimientoController:', error);
    res.status(500).json(respuestaError(error.message, 500));
  }
}

/**
 * Obtener un tipo de movimiento específico por ID.
 * Middleware requerido: authMiddleware, validationMiddleware
 */
async function obtenerTipoMovimientoController(req, res) {
  try {
    const { id } = req.params;

    // Validar que el ID sea numérico
    const idTipo = Number(id);
    if (isNaN(idTipo)) {
      return res.status(400).json(respuestaError('ID de tipo de movimiento inválido', 400));
    }

    const tipoMovimiento = await obtenerTipoMovimientoPorId(idTipo);

    sendSuccess(res, tipoMovimiento, 'Tipo de movimiento obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerTipoMovimientoController:', error);

    // Determinar código de error apropiado
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json(respuestaError(error.message, statusCode));
  }
}

/**
 * Actualizar un tipo de movimiento existente.
 * Middleware requerido: authMiddleware, validationMiddleware
 */
async function actualizarTipoMovimientoController(req, res) {
  try {
    const { id } = req.params;
    const { nombreTipo, tipo, afectaCosto, descripcion, activo } = req.body;

    // Validar que el ID sea numérico
    const idTipo = Number(id);
    if (isNaN(idTipo)) {
      return res.status(400).json(respuestaError('ID de tipo de movimiento inválido', 400));
    }

    const tipoActualizado = await actualizarTipoMovimiento(idTipo, {
      nombreTipo,
      tipo,
      afectaCosto,
      descripcion,
      activo,
    });

    sendSuccess(res, tipoActualizado, 'Tipo de movimiento actualizado exitosamente');
  } catch (error) {
    console.error('Error en actualizarTipoMovimientoController:', error);
    res.status(400).json(respuestaError(error.message, 400));
  }
}

/**
 * Desactivar un tipo de movimiento (borrado lógico).
 * Middleware requerido: authMiddleware, validationMiddleware
 */
async function desactivarTipoMovimientoController(req, res) {
  try {
    const { id } = req.params;

    // Validar que el ID sea numérico
    const idTipo = Number(id);
    if (isNaN(idTipo)) {
      return res.status(400).json(respuestaError('ID de tipo de movimiento inválido', 400));
    }

    const tipoDesactivado = await desactivarTipoMovimiento(idTipo);

    sendSuccess(res, tipoDesactivado, 'Tipo de movimiento desactivado exitosamente');
  } catch (error) {
    console.error('Error en desactivarTipoMovimientoController:', error);
    res.status(400).json(respuestaError(error.message, 400));
  }
}

module.exports = {
  crearTipoMovimientoController,
  obtenerTiposMovimientoController,
  obtenerTipoMovimientoController,
  actualizarTipoMovimientoController,
  desactivarTipoMovimientoController,
};
