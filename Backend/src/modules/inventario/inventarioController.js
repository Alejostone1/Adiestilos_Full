/**
 * Controlador para Inventario.
 * Maneja las solicitudes HTTP relacionadas con consultas de inventario.
 *
 * NOTA: Los controladores deben usar middleware de autenticación y validación.
 * Ejemplo de middleware necesario:
 * - authMiddleware: Para verificar autenticación del usuario
 * - validationMiddleware: Para validar datos de entrada
 */

const { sendSuccess, respuestaError } = require('../../utils/responseHelper');
const {
  obtenerStock,
  obtenerEstadisticasInventario,
  obtenerStockVariante,
  obtenerMovimientos,
} = require('./inventarioService');

/**
 * Obtener stock actual con filtros y paginación.
 * Middleware requerido: authMiddleware (para req.user)
 */
async function obtenerStockController(req, res) {
  try {
    // Extraer parámetros de query con valores por defecto
    const {
      pagina = 1,
      limite = 15,
      idProducto,
      stockBajo,
      sinStock
    } = req.query;

    // Construir filtros
    const filtros = {};
    if (idProducto) filtros.idProducto = Number(idProducto);
    if (stockBajo === 'true') filtros.stockBajo = true;
    if (sinStock === 'true') filtros.sinStock = true;

    // Llamar al servicio
    const resultado = await obtenerStock(filtros, {
      pagina: Number(pagina),
      limite: Number(limite),
    });

    sendSuccess(res, resultado, 'Stock actual obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerStockController:', error);
    res.status(500).json(respuestaError(error.message, 500));
  }
}

/**
 * Obtener estadísticas del inventario.
 * Middleware requerido: authMiddleware
 */
async function obtenerEstadisticasController(req, res) {
  try {
    const estadisticas = await obtenerEstadisticasInventario();

    sendSuccess(res, estadisticas, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    console.error('Error en obtenerEstadisticasController:', error);
    console.error('Stack:', error.stack);
    res.status(500).json(respuestaError(error.message, 500));
  }
}

/**
 * Obtener stock de una variante específica.
 * Middleware requerido: authMiddleware, validationMiddleware (para validar id)
 */
async function obtenerStockVarianteController(req, res) {
  try {
    const { id } = req.params;

    // Validar que el ID sea numérico
    const idVariante = Number(id);
    if (isNaN(idVariante)) {
      return responseHelper.error(res, 'ID de variante inválido', 400);
    }

    const stock = await obtenerStockVariante(idVariante);

    sendSuccess(res, stock, 'Stock de variante obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerStockVarianteController:', error);

    // Determinar código de error apropiado
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json(respuestaError(error.message, statusCode));
  }
}

/**
 * Obtener movimientos de inventario con filtros y paginación.
 * Middleware requerido: authMiddleware
 */
async function obtenerMovimientosController(req, res) {
  try {
    const {
      pagina = 1,
      limite = 20,
      idVariante,
      idTipoMovimiento,
      fechaInicio,
      fechaFin
    } = req.query;

    // Construir filtros
    const filtros = {};
    if (idVariante) filtros.idVariante = Number(idVariante);
    if (idTipoMovimiento) filtros.idTipoMovimiento = Number(idTipoMovimiento);
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;

    const resultado = await obtenerMovimientos(filtros, {
      pagina: Number(pagina),
      limite: Number(limite),
    });

    sendSuccess(res, resultado, 'Movimientos de inventario obtenidos exitosamente');
  } catch (error) {
    console.error('Error en obtenerMovimientosController:', error);
    res.status(500).json(respuestaError(error.message, 500));
  }
}

module.exports = {
  obtenerStockController,
  obtenerEstadisticasController,
  obtenerStockVarianteController,
  obtenerMovimientosController,
};
