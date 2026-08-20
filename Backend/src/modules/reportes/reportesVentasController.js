/**
 * Controlador para Reportes de Ventas.
 * Maneja las solicitudes para generar reportes consolidados de ventas.
 */

// --- IMPORTACIONES ---
const reportesVentasService = require('./reportesVentasService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADOR ---

/**
 * Controlador para obtener un reporte de ventas por rango de fechas y agrupaciones.
 * @route GET /api/reportes/ventas
 */
const obtenerReporteVentas = capturarErroresAsync(async (req, res) => {
  const { fechaInicio, fechaFin, agruparPor } = req.query; // agruparPor: 'dia', 'mes', 'vendedor', 'cliente'

  const reporte = await reportesVentasService.generarReporteVentas({ fechaInicio, fechaFin, agruparPor });

  res.status(200).json(respuestaExitosa(reporte, 'Reporte de ventas generado exitosamente.'));
});

// --- EXPORTACIÓN ---
module.exports = {
  obtenerReporteVentas
};
