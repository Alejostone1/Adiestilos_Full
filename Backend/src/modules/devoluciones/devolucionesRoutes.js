/**
 * Rutas para el módulo de Devoluciones.
 * Define los endpoints para la creación y consulta de devoluciones.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  crearDevolucion,
  obtenerDevolucionPorId,
  obtenerDevoluciones,
  actualizarDevolucion,
  cambiarEstadoDevolucion,
  eliminarDevolucion
} = require('./devolucionesController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// Middleware para la mayoría de las operaciones de devoluciones
const rolesGestion = ['Administrador', 'Vendedor', 'Bodeguero'];
const middlewareDeGestion = [verificarTokenMiddleware, verificarRol(rolesGestion)];

/**
 * @route   POST /api/devoluciones
 * @desc    Crear una nueva devolución sobre una venta.
 * @access  Administrador, Vendedor, Bodeguero
 */
router.post('/', middlewareDeGestion, crearDevolucion);

/**
 * @route   GET /api/devoluciones
 * @desc    Obtener una lista de todas las devoluciones con filtros.
 * @access  Administrador, Vendedor, Bodeguero
 */
router.get('/', middlewareDeGestion, obtenerDevoluciones);

/**
 * @route   GET /api/devoluciones/:id
 * @desc    Obtener una devolución específica por su ID.
 * @access  Administrador, Vendedor, Bodeguero, y el Cliente propietario.
 */
router.get('/:id', verificarTokenMiddleware, obtenerDevolucionPorId);

/**
 * @route   PUT /api/devoluciones/:id
 * @desc    Actualizar una devolución existente.
 * @access  Administrador, Vendedor, Bodeguero
 */
router.put('/:id', middlewareDeGestion, actualizarDevolucion);

/**
 * @route   PATCH /api/devoluciones/:id/estado
 * @desc    Cambiar el estado de una devolución.
 * @access  Administrador, Vendedor, Bodeguero
 */
router.patch('/:id/estado', middlewareDeGestion, cambiarEstadoDevolucion);

/**
 * @route   DELETE /api/devoluciones/:id
 * @desc    Eliminar una devolución (baja lógica).
 * @access  Administrador, Vendedor, Bodeguero
 */
router.delete('/:id', middlewareDeGestion, eliminarDevolucion);


// --- EXPORTACIÓN ---
module.exports = router;
