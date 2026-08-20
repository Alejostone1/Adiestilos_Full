
/**
 * @file coloresRoutes.js
 * @brief Archivo de rutas para el módulo de Colores.
 *
 * Este archivo define las rutas para las operaciones CRUD del módulo de colores.
 * Asocia cada ruta HTTP (GET, POST, PUT, DELETE) con su respectivo
 * manejador en el controlador de colores.
 */

// Importación de Express y el Router
const express = require('express');
const router = express.Router();

// Importación del controlador de colores
const coloresController = require('./coloresController');

/**
 * @route GET /api/colores
 * @description Ruta para obtener un listado de todos los colores.
 * @access Público
 */
router.get('/', coloresController.listarColores);

/**
 * @route GET /api/colores/:id
 * @description Ruta para obtener un color específico por su ID.
 * @access Público
 */
router.get('/:id', coloresController.obtenerColorPorId);

/**
 * @route POST /api/colores
 * @description Ruta para crear un nuevo color.
 * @access Protegido (se asume que se añadirá middleware de autenticación y autorización)
 */
router.post('/', coloresController.crearColor);

/**
 * @route PUT /api/colores/:id
 * @description Ruta para actualizar un color existente por su ID.
 * @access Protegido (se asume que se añadirá middleware de autenticación y autorización)
 */
router.put('/:id', coloresController.actualizarColor);

/**
 * @route DELETE /api/colores/:id
 * @description Ruta para "eliminar" (desactivar) un color por su ID.
 * @access Protegido (se asume que se añadirá middleware de autenticación y autorización)
 */
router.delete('/:id', coloresController.eliminarColor);

// Exportar el router para ser utilizado por la aplicación principal
module.exports = router;
