
/**
 * @file tallasRoutes.js
 * @brief Archivo de rutas para el módulo de Tallas.
 *
 * Este archivo establece las rutas de la API para el recurso de tallas.
 * Cada ruta se asigna a una función específica en el controlador de tallas,
 * permitiendo realizar operaciones CRUD a través de endpoints HTTP.
 */

// Importación de Express y su componente Router
const express = require('express');
const router = express.Router();

// Importación del controlador que manejará la lógica de las solicitudes
const tallasController = require('./tallasController');

/**
 * @route GET /api/tallas
 * @description Ruta para obtener una lista de todas las tallas.
 * @access Público
 */
router.get('/', tallasController.listarTallas);

/**
 * @route GET /api/tallas/:id
 * @description Ruta para obtener una talla específica por su ID.
 * @access Público
 */
router.get('/:id', tallasController.obtenerTallaPorId);

/**
 * @route POST /api/tallas
 * @description Ruta para la creación de una nueva talla.
 * @access Protegido (requiere autenticación y autorización)
 */
router.post('/', tallasController.crearTalla);

/**
 * @route PUT /api/tallas/:id
 * @description Ruta para actualizar una talla existente por su ID.
 * @access Protegido (requiere autenticación y autorización)
 */
router.put('/:id', tallasController.actualizarTalla);

/**
 * @route DELETE /api/tallas/:id
 * @description Ruta para realizar un borrado lógico (desactivar) de una talla por su ID.
 * @access Protegido (requiere autenticación y autorización)
 */
router.delete('/:id', tallasController.eliminarTalla);

// Exportar el enrutador para que sea utilizado en la configuración principal de la aplicación
module.exports = router;
