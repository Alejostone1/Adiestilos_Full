/**
 * Controlador para Reportes de Inventario.
 */

// --- IMPORTACIONES ---
const reportesInventarioService = require('./reportesInventarioService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADOR ---

/**
 * Controlador para obtener un reporte de inventario.
 * @route GET /api/reportes/inventario
 */
const obtenerReporteInventario = capturarErroresAsync(async (req, res) => {
  const { tipoReporte = 'valoracion' } = req.query; // 'valoracion', 'stock_bajo', 'movimientos_recientes'

  const reporte = await reportesInventarioService.generarReporteInventario({ tipoReporte });

  res.status(200).json(respuestaExitosa(reporte, `Reporte de inventario (${tipoReporte}) generado.`));
});

// --- EXPORTACIÓN ---
module.exports = {
  obtenerReporteInventario
};
