/**
 * Rutas para el módulo de gestión de usuarios.
 * Define los endpoints para las operaciones CRUD de usuarios.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  obtenerTodosLosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  obtenerUsuariosConCredito,
  obtenerMetricasUsuario,
  obtenerHistorialVentasUsuario,
  obtenerHistorialCreditosUsuario
} = require('./usuariosController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN ---
// Aplicar a todas las rutas de este módulo, ya que la gestión de usuarios
// es una tarea administrativa.
router.use(verificarTokenMiddleware);
router.use(verificarRol('Administrador')); // Solo los administradores pueden gestionar usuarios

// --- DEFINICIÓN DE RUTAS ---

/**
 * @route   GET /api/usuarios
 * @desc    Obtener todos los usuarios con filtros y paginación.
 * @access  Administrador
 */
router.get('/', obtenerTodosLosUsuarios);

/**
 * @route   POST /api/usuarios
 * @desc    Crear un nuevo usuario.
 * @access  Administrador
 */
router.post('/', crearUsuario);

/**
 * @route   GET /api/usuarios/con-credito
 * @desc    Obtener clientes con crédito activo.
 * @access  Administrador, Vendedor
 */
// Se define antes de '/:id' para evitar que 'con-credito' sea interpretado como un ID.
// Se le asigna un middleware específico porque los Vendedores también pueden necesitar esta info.
router.get('/con-credito', verificarRol(['Administrador', 'Vendedor']), obtenerUsuariosConCredito);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener un usuario por su ID.
 * @access  Administrador
 */
router.get('/:id', obtenerUsuarioPorId);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar un usuario existente.
 * @access  Administrador
 */
router.put('/:id', actualizarUsuario);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Eliminar (soft delete) un usuario.
 * @access  Administrador
 */
router.delete('/:id', eliminarUsuario);

/**
 * @route   PATCH /api/usuarios/:id/estado
 * @desc    Cambiar el estado de un usuario.
 * @access  Administrador
 */
router.patch('/:id/estado', cambiarEstadoUsuario);

/**
 * @route   GET /api/usuarios/:id/metricas
 * @desc    Obtener métricas de un usuario.
 * @access  Administrador
 */
router.get('/:id/metricas', obtenerMetricasUsuario);

/**
 * @route   GET /api/usuarios/:id/ventas
 * @desc    Obtener historial de ventas de un usuario.
 * @access  Administrador
 */
router.get('/:id/ventas', obtenerHistorialVentasUsuario);

/**
 * @route   GET /api/usuarios/:id/creditos
 * @desc    Obtener historial de créditos de un usuario.
 * @access  Administrador
 */
router.get('/:id/creditos', obtenerHistorialCreditosUsuario);


// --- EXPORTACIÓN ---
module.exports = router;
