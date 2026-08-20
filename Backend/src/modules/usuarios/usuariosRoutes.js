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
const { verificarTokenMiddleware, verificarRol, verificarPropiedad } = require('../../middleware/authMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- MIDDLEWARE DE AUTENTICACIÓN ---
// Aplicar a todas las rutas de este módulo.
router.use(verificarTokenMiddleware);

// --- CONSULTAS PROPIAS (Cliente, Vendedor y Administrador) ---
// Estas rutas deben registrarse ANTES del guard de Administrador para permitir
// que cada usuario consulte SUS propios datos (el Cliente) o, en el caso del
// Vendedor/Administrador, los datos de cualquier cliente.

/**
 * @route   GET /api/usuarios/con-credito
 * @desc    Obtener clientes con crédito activo.
 * @access  Administrador, Vendedor
 */
router.get('/con-credito', verificarRol(['Administrador', 'Vendedor']), obtenerUsuariosConCredito);

/**
 * @route   GET /api/usuarios/:id/metricas
 * @desc    Obtener métricas de un usuario (propias, o de cualquier cliente para Vendedor/Admin).
 * @access  Propietario, Administrador, Vendedor
 */
router.get('/:id/metricas', verificarPropiedad('id', ['Administrador', 'Vendedor']), obtenerMetricasUsuario);

/**
 * @route   GET /api/usuarios/:id/ventas
 * @desc    Obtener historial de ventas de un usuario (propias, o de cualquier cliente para Vendedor/Admin).
 * @access  Propietario, Administrador, Vendedor
 */
router.get('/:id/ventas', verificarPropiedad('id', ['Administrador', 'Vendedor']), obtenerHistorialVentasUsuario);

/**
 * @route   GET /api/usuarios/:id/creditos
 * @desc    Obtener historial de créditos de un usuario (propias, o de cualquier cliente para Vendedor/Admin).
 * @access  Propietario, Administrador, Vendedor
 */
router.get('/:id/creditos', verificarPropiedad('id', ['Administrador', 'Vendedor']), obtenerHistorialCreditosUsuario);

// --- ADMINISTRACIÓN (solo Administrador) ---
router.use(verificarRol('Administrador'));

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


// --- EXPORTACIÓN ---
module.exports = router;
