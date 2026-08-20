/**
 * Rutas públicas del e-commerce
 * No requieren autenticación
 */

const { Router } = require('express');
const publicController = require('./publicController');

const router = Router();

// Categorías
router.get('/categorias', publicController.listarCategorias);
router.get('/categorias/:idOSlug', publicController.obtenerCategoria);
router.get('/categorias/:id/productos', publicController.listarProductosCategoria);

// Productos
router.get('/productos', publicController.listarProductos);
router.get('/productos/destacados', publicController.listarProductosDestacados);
router.get('/productos/:id', publicController.obtenerProducto);
router.get('/productos/:id/variantes', publicController.listarVariantesProducto);

// Búsqueda
router.get('/buscar', publicController.buscarProductos);

module.exports = router;
