
/**
 * @file imagenesRoutes.js
 * @brief Archivo de rutas para el módulo de gestión de Imágenes.
 *
 * Este archivo define los endpoints de la API para todas las operaciones relacionadas con imágenes,
 * incluyendo la subida, listado, actualización y eliminación de imágenes de productos y variantes.
 * Utiliza middleware de `multer` para procesar la carga de archivos.
 */

const express = require('express');
const router = express.Router();
const imagenesController = require('./imagenesController');
const { subirImagenProducto, subirImagenVariante } = require('../../middleware/uploadMiddleware');

// --- Rutas para Imágenes de Productos ---

/**
 * @route POST /api/imagenes/producto/:idProducto
 * @description Sube una nueva imagen para un producto específico.
 * @access Protegido
 * @middleware subirImagenProducto - Procesa el archivo 'imagen' antes de pasar al controlador.
 */
router.post('/producto/:idProducto', subirImagenProducto, imagenesController.subirImagenProducto);

/**
 * @route GET /api/imagenes/producto/:idProducto
 * @description Lista todas las imágenes de un producto específico.
 * @access Público
 */
router.get('/producto/:idProducto', imagenesController.listarImagenesProducto);

/**
 * @route DELETE /api/imagenes/producto/:idImagen
 * @description Elimina una imagen de producto por su ID.
 * @access Protegido
 */
router.delete('/producto/:idImagen', imagenesController.eliminarImagenProducto);

/**
 * @route PUT /api/imagenes/producto/:idImagen
 * @description Actualiza los metadatos (descripción, orden) de una imagen de producto.
 * @access Protegido
 */
router.put('/producto/:idImagen', imagenesController.actualizarDatosImagenProducto);

/**
 * @route POST /api/imagenes/producto/:idImagen/principal
 * @description Establece una imagen de producto como la principal.
 * @access Protegido
 */
router.post('/producto/:idImagen/principal', imagenesController.definirPrincipalProducto);


// --- Rutas para Imágenes de Variantes ---

/**
 * @route POST /api/imagenes/variante/:idVariante
 * @description Sube una nueva imagen para una variante de producto específica.
 * @access Protegido
 * @middleware subirImagenVariante - Procesa el archivo 'imagen' antes de pasar al controlador.
 */
router.post('/variante/:idVariante', subirImagenVariante, imagenesController.subirImagenVariante);

/**
 * @route GET /api/imagenes/variante/:idVariante
 * @description Lista todas las imágenes de una variante de producto específica.
 * @access Público
 */
router.get('/variante/:idVariante', imagenesController.listarImagenesVariante);

/**
 * @route DELETE /api/imagenes/variante/:idImagen
 * @description Elimina una imagen de variante por su ID.
 * @access Protegido
 */
router.delete('/variante/:idImagen', imagenesController.eliminarImagenVariante);

/**
 * @route PUT /api/imagenes/variante/:idImagen
 * @description Actualiza los metadatos (descripción, orden) de una imagen de variante.
 * @access Protegido
 */
router.put('/variante/:idImagen', imagenesController.actualizarDatosImagenVariante);

/**
 * @route POST /api/imagenes/variante/:idImagen/principal
 * @description Establece una imagen de variante como la principal.
 * @access Protegido
 */
router.post('/variante/:idImagen/principal', imagenesController.definirPrincipalVariante);


module.exports = router;
