/**
 * Rutas para el módulo de Créditos.
 * Define los endpoints para la gestión de créditos de clientes.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerTodosLosCreditos,
  obtenerCreditoPorId,
  obtenerCreditosPorCliente,
  agregarAbono
} = require('./creditosController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// Middleware para proteger todas las rutas de créditos
const rolesPermitidos = ['Administrador', 'Cajero', 'Vendedor'];
const middlewareDeCreditos = [verificarTokenMiddleware, verificarRol(rolesPermitidos)];

/**
 * @route   GET /api/creditos
 * @desc    Obtener una lista de todos los créditos con filtros.
 * @access  Administrador, Cajero, Vendedor
 */
router.get('/', middlewareDeCreditos, obtenerTodosLosCreditos);

/**
 * @route   GET /api/creditos/cliente/:idUsuario
 * @desc    Obtener todos los créditos de un cliente específico.
 * @access  Administrador, Cajero, Vendedor, y el propio Cliente
 */
router.get('/cliente/:idUsuario', verificarTokenMiddleware, obtenerCreditosPorCliente);

/**
 * @route   GET /api/creditos/:id
 * @desc    Obtener un crédito específico por su ID.
 * @access  Administrador, Cajero, Vendedor, y el propio Cliente
 */
router.get('/:id', verificarTokenMiddleware, obtenerCreditoPorId);

/**
 * @route   POST /api/creditos/:id/abonos
 * @desc    Agregar un pago (abono) a un crédito existente.
 * @access  Administrador, Cajero
 */
router.post('/:id/abonos', [verificarTokenMiddleware, verificarRol(['Administrador', 'Cajero'])], agregarAbono);


// --- EXPORTACIÓN ---
module.exports = router;
