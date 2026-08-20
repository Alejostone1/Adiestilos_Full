/**
 * Controlador para Reportes de Créditos.
 */

// --- IMPORTACIONES ---
const reportesCreditosService = require('./reportesCreditosService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADOR ---

/**
 * Controlador para obtener un reporte de créditos.
 * @route GET /api/reportes/creditos
 */
const obtenerReporteCreditos = capturarErroresAsync(async (req, res) => {
  const { estado = 'activo' } = req.query; // 'activo', 'vencido', 'pagado'

  const reporte = await reportesCreditosService.generarReporteCreditos({ estado });

  res.status(200).json(respuestaExitosa(reporte, `Reporte de créditos (${estado}) generado.`));
});

// --- EXPORTACIÓN ---
module.exports = {
  obtenerReporteCreditos
};
