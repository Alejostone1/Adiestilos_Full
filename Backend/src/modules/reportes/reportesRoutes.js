/**
 * Rutas para el módulo de Reportes.
 * Define los endpoints para acceder a datos consolidados y reportes de negocio.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerResumenDashboard
} = require('./dashboardController');
const {
    obtenerReporteVentas
} = require('./reportesVentasController');
const {
    obtenerReporteInventario
} = require('./reportesInventarioController');
const {
    obtenerReporteCreditos
} = require('./reportesCreditosController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// Middleware para proteger todas las rutas de reportes
const rolesPermitidos = ['Administrador', 'Gerente'];
const middlewareDeReportes = [verificarTokenMiddleware, verificarRol(rolesPermitidos)];

// Usar el middleware para todas las rutas de este enrutador
router.use(middlewareDeReportes);

/**
 * @route   GET /api/reportes/dashboard
 * @desc    Obtener un resumen de datos clave para el dashboard principal.
 * @access  Administrador, Gerente
 */
router.get('/dashboard', obtenerResumenDashboard);

/**
 * @route   GET /api/reportes/ventas
 * @desc    Obtener un reporte detallado de ventas por rango de fechas.
 * @access  Administrador, Gerente
 */
router.get('/ventas', obtenerReporteVentas);

/**
 * @route   GET /api/reportes/inventario
 * @desc    Obtener un reporte del estado del inventario (valoración, stock bajo).
 * @access  Administrador, Gerente
 */
router.get('/inventario', obtenerReporteInventario);

/**
 * @route   GET /api/reportes/creditos
 * @desc    Obtener un reporte sobre el estado de la cartera de créditos.
 * @access  Administrador, Gerente
 */
router.get('/creditos', obtenerReporteCreditos);


// --- EXPORTACIÓN ---
module.exports = router;
