/**
 * Rutas para el módulo de autenticación.
 * Define los endpoints para registro, login, perfil, etc.
 */

// --- IMPORTACIONES ---
const { Router } = require('express');
const {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfil,
  cambiarContrasena
} = require('./authController');
const { verificarTokenMiddleware } = require('../../middleware/authMiddleware');
const { validar, esquemas } = require('../../middleware/validationMiddleware');

// Crear una instancia del enrutador
const router = Router();

// --- DEFINICIÓN DE RUTAS ---

// =================================================================
// RUTAS PÚBLICAS (no requieren autenticación)
// =================================================================

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar un nuevo usuario.
 * @access  Público
 */
router.post('/registro', validar(esquemas.registroUsuario), registrarUsuario);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión y obtener tokens.
 * @access  Público
 */
router.post('/login', validar(esquemas.login), iniciarSesion);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (operación del lado del cliente).
 * @access  Público
 */
router.post('/logout', cerrarSesion);


// =================================================================
// RUTAS PROTEGIDAS (requieren un token de acceso válido)
// =================================D================================

// A partir de aquí, todas las rutas en este archivo requerirán autenticación.
// El middleware `verificarTokenMiddleware` se aplica a las rutas que lo necesiten.
// Si todas las rutas de abajo fueran protegidas, se podría usar: router.use(verificarTokenMiddleware);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener la información del usuario autenticado.
 * @access  Privado
 */
router.get('/perfil', verificarTokenMiddleware, obtenerPerfil);

/**
 * @route   PUT /api/auth/cambiar-contrasena
 * @desc    Cambiar la contraseña del usuario autenticado.
 * @access  Privado
 */
router.put('/cambiar-contrasena', verificarTokenMiddleware, cambiarContrasena);


// --- EXPORTACIÓN ---
module.exports = router;
