/**
 * Controlador para la gestión de Pagos.
 * Maneja las solicitudes HTTP para la consulta de información de pagos.
 */

// --- IMPORTACIONES ---
const pagosService = require('./pagosService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para obtener todos los pagos de una venta.
 * @route GET /api/pagos/venta/:idVenta
 */
const obtenerPagosPorVenta = capturarErroresAsync(async (req, res) => {
  const { idVenta } = req.params;
  const pagos = await pagosService.obtenerPorVenta(idVenta, req.usuario);
  res.status(200).json(respuestaExitosa(pagos, 'Pagos de la venta obtenidos exitosamente.'));
});

/**
 * Controlador para obtener un pago por su ID.
 * @route GET /api/pagos/:id
 */
const obtenerPagoPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const pago = await pagosService.obtenerPorId(id, req.usuario);
  res.status(200).json(respuestaExitosa(pago));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerPagosPorVenta,
  obtenerPagoPorId
};
