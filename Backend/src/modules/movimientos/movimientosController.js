
/**
 * Controlador para Movimientos de Inventario.
 * Maneja las consultas de historial de movimientos (solo lectura).
 */

const { sendSuccess, respuestaError } = require('../../utils/responseHelper');
const {
  obtenerMovimientos,
  obtenerMovimientoPorId,
} = require('./movimientosService');

/**
 * Obtener movimientos de inventario con filtros y paginación.
 * Middleware requerido: authMiddleware
 */
async function obtenerMovimientosController(req, res) {
  try {
    const {
      page = 1,
      pageSize = 10,
      ...filters
    } = req.query;

    const resultado = await obtenerMovimientos(filters, Number(page), Number(pageSize));

    sendSuccess(res, resultado, 'Movimientos obtenidos exitosamente');
  } catch (error) {
    console.error('Error en obtenerMovimientosController:', error);
    res.status(500).json(respuestaError(error.message, 500));
  }
}

/**
 * Obtener un movimiento específico por ID.
 * Middleware requerido: authMiddleware, validationMiddleware (para validar id)
 */
async function obtenerMovimientoController(req, res) {
  try {
    const { id } = req.params;

    // Validar que el ID sea numérico
    const idMovimiento = Number(id);
    if (isNaN(idMovimiento)) {
      return res.status(400).json(respuestaError('ID de movimiento inválido', 400));
    }

    const movimiento = await obtenerMovimientoPorId(idMovimiento);

    sendSuccess(res, movimiento, 'Movimiento obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerMovimientoController:', error);

    // Determinar código de error apropiado
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json(respuestaError(error.message, statusCode));
  }
}

module.exports = {
  obtenerMovimientosController,
  obtenerMovimientoController,
};
