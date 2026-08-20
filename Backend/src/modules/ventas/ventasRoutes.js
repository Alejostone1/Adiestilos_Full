/**
 * Rutas para el módulo de Ventas.
 * Define los endpoints para acceder a las funcionalidades del controlador de ventas.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerTodasLasVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarEstadoVenta
} = require('./ventasController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// Middleware para proteger todas las rutas de ventas
const rolesPermitidos = ['Administrador', 'Vendedor', 'Cajero'];
const middlewareDeVentas = [verificarTokenMiddleware, verificarRol(rolesPermitidos)];

/**
 * @route   GET /api/ventas
 * @desc    Obtener lista de ventas con filtros y paginación.
 * @access  Administrador, Vendedor, Cajero
 */
router.get('/', middlewareDeVentas, obtenerTodasLasVentas);

/**
 * @route   GET /api/ventas/:id
 * @desc    Obtener una venta específica por su ID.
 * @access  Administrador, Vendedor, Cajero
 */
router.get('/:id', middlewareDeVentas, obtenerVentaPorId);

/**
 * @route   POST /api/ventas
 * @desc    Crear una nueva venta.
 * @access  Administrador, Vendedor, Cajero
 */
router.post('/', middlewareDeVentas, crearVenta);

/**
 * @route   PATCH /api/ventas/:id/estado
 * @desc    Actualizar el estado de una venta (pedido).
 * @access  Administrador, Vendedor
 */
router.patch('/:id/estado', [verificarTokenMiddleware, verificarRol(['Administrador', 'Vendedor'])], actualizarEstadoVenta);


// --- EXPORTACIÓN ---
module.exports = router;
