/**
 * Controlador para el Dashboard.
 * Orquesta la obtención de datos resumidos para el panel principal.
 */

// --- IMPORTACIONES ---
const dashboardService = require('./dashboardService');
const { respuestaExitosa } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADOR ---

/**
 * Controlador para obtener el resumen de datos del dashboard.
 * @route GET /api/reportes/dashboard
 */
const obtenerResumenDashboard = capturarErroresAsync(async (req, res) => {
  const { rango = 'dia' } = req.query; // dia, semana, mes
  const resumen = await dashboardService.obtenerResumen(rango);
  res.status(200).json(respuestaExitosa(resumen, 'Resumen del dashboard obtenido exitosamente.'));
});

// --- EXPORTACIÓN ---
module.exports = {
  obtenerResumenDashboard
};
