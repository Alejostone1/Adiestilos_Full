/**
 * Rutas para el módulo de Compras.
 * Define los endpoints para la creación, gestión y recepción de compras a proveedores.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  crearCompra,
  obtenerCompraPorId,
  obtenerTodasLasCompras,
  recibirCompra,
  actualizarEstadoCompra
} = require('./comprasController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');
const { validarCreacionCompra, validarRecepcionCompra } = require('./comprasValidators');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// Middleware para proteger todas las rutas de compras
const rolesPermitidos = ['Administrador', 'Bodeguero'];
const middlewareDeCompras = [verificarTokenMiddleware, verificarRol(rolesPermitidos)];

// Aplicar middleware a todas las rutas de este módulo
router.use(middlewareDeCompras);

/**
 * @route   POST /api/compras
 * @desc    Crear una nueva orden de compra.
 * @access  Administrador, Bodeguero
 */
router.post('/', validarCreacionCompra, crearCompra);

/**
 * @route   GET /api/compras
 * @desc    Obtener una lista de todas las compras con filtros.
 * @access  Administrador, Bodeguero
 */
router.get('/', obtenerTodasLasCompras);

/**
 * @route   GET /api/compras/:id
 * @desc    Obtener una compra específica por su ID.
 * @access  Administrador, Bodeguero
 */
router.get('/:id', obtenerCompraPorId);

/**
 * @route   POST /api/compras/:id/recibir
 * @desc    Marcar una compra como recibida y actualizar el inventario.
 * @access  Administrador, Bodeguero
 */
router.post('/:id/recibir', validarRecepcionCompra, recibirCompra);


/**
 * @route   PATCH /api/compras/:id/estado
 * @desc    Actualizar el estado de una compra.
 * @access  Administrador, Bodeguero
 */
router.patch('/:id/estado', actualizarEstadoCompra);

// --- EXPORTACIÓN ---
module.exports = router;
