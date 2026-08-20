/**
 * Rutas para el módulo de Pagos.
 * Define los endpoints para consultar información de pagos.
 * La creación de pagos se realiza a través de los módulos de Ventas y Créditos.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerPagosPorVenta,
  obtenerPagoPorId
} = require('./pagosController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// Middleware para proteger las rutas de consulta de pagos
const rolesPermitidos = ['Administrador', 'Cajero', 'Vendedor'];
const middlewareDePagos = [verificarTokenMiddleware, verificarRol(rolesPermitidos)];

/**
 * @route   GET /api/pagos/venta/:idVenta
 * @desc    Obtener todos los pagos asociados a una venta.
 * @access  Administrador, Cajero, Vendedor y Cliente propietario de la venta.
 */
router.get('/venta/:idVenta', verificarTokenMiddleware, obtenerPagosPorVenta);

/**
 * @route   GET /api/pagos/:id
 * @desc    Obtener un pago específico por su ID.
 * @access  Administrador, Cajero, Vendedor y Cliente propietario de la venta.
 */
router.get('/:id', verificarTokenMiddleware, obtenerPagoPorId);


// --- EXPORTACIÓN ---
module.exports = router;
