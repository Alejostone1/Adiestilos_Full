
/**
 * @file rolesRoutes.js
 * @brief Archivo de rutas para el módulo de Roles.
 *
 * Este archivo define los endpoints de la API para la gestión de roles.
 * Asocia las rutas HTTP con las funciones del controlador y aplica
 * validaciones de entrada utilizando el `validationHelper`.
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rolesController = require('./rolesController');
const { validadores, manejarResultadosValidacion } = require('../../utils/validationHelper');
const { verificarTokenMiddleware, verificarPermisos } = require('../../middleware/authMiddleware');

// Solo usuarios autenticados con permiso explícito en 'roles' pueden acceder
router.use(verificarTokenMiddleware);
router.use(verificarPermisos('roles', 'full'));

/**
 * @route GET /api/roles
 * @description Ruta para obtener un listado de todos los roles.
 * @access Protegido (Admin)
 */
router.get('/', rolesController.listarRoles);

/**
 * @route GET /api/roles/permisos/lista
 * @description Obtiene la lista de todos los permisos que el sistema reconoce.
 * @access Protegido (Admin)
 */
router.get('/permisos/lista', rolesController.obtenerListaPermisos);

/**
 * @route GET /api/roles/:id
 * @description Ruta para obtener un rol específico por su ID.
 * @access Protegido (Admin)
 */
router.get(
  '/:id',
  validadores.idEnParametro('id'),
  manejarResultadosValidacion,
  rolesController.obtenerRolPorId
);

/**
 * @route POST /api/roles
 * @description Ruta para la creación de un nuevo rol.
 * @access Protegido (Admin)
 */
router.post(
  '/',
  [
    validadores.texto('nombreRol', { max: 50 }),
    validadores.texto('descripcion', { opcional: true }),
    body('permisos')
      .optional()
      .isObject()
      .withMessage('El campo permisos debe ser un objeto JSON válido.'),
  ],
  manejarResultadosValidacion,
  rolesController.crearRol
);

/**
 * @route PUT /api/roles/:id
 * @description Ruta para actualizar un rol existente por su ID.
 * @access Protegido (Admin)
 */
router.put(
  '/:id',
  [
    validadores.idEnParametro('id'),
    validadores.texto('nombreRol', { opcional: true, max: 50 }),
    validadores.texto('descripcion', { opcional: true }),
    body('permisos')
      .optional()
      .isObject()
      .withMessage('El campo permisos debe ser un objeto JSON válido.'),
  ],
  manejarResultadosValidacion,
  rolesController.actualizarRol
);

/**
 * @route DELETE /api/roles/:id
 * @description Ruta para eliminar un rol por su ID.
 * @access Protegido (Admin)
 */
router.delete(
  '/:id',
  validadores.idEnParametro('id'),
  manejarResultadosValidacion,
  rolesController.eliminarRol
);

/**
 * @route PATCH /api/roles/:id/estado
 * @description Ruta para activar/desactivar un rol.
 * @access Protegido (Admin)
 */
router.patch(
  '/:id/estado',
  [
    validadores.idEnParametro('id'),
    body('activo').isBoolean().withMessage('El campo activo es obligatorio y debe ser booleano.')
  ],
  manejarResultadosValidacion,
  rolesController.cambiarEstadoRol
);

module.exports = router;
