/**
 * =====================================================
 * RUTAS DEL MÓDULO DE PRODUCTOS
 * =====================================================
 * Define todos los endpoints relacionados con:
 *  - Productos
 *  - Variantes
 *  - Inventario
 *  - Imágenes
 *
 * Arquitectura REST profesional
 * =====================================================
 */

// -----------------------------------------------------
// IMPORTACIONES
// -----------------------------------------------------
const { Router } = require('express');

const {
  // Productos
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductoPorCodigo,
  obtenerProductosPorCategoria,
  obtenerProductosPorProveedor,

  // Variantes
  obtenerVariantesPorProducto,
  crearVarianteProducto,
  actualizarVarianteProducto,
  eliminarVarianteProducto,

  // Inventario
  obtenerProductosSinStock,
  obtenerProductosConStockBajo,

  // Imágenes
  obtenerProductosSinImagenes,
  cambiarImagenPrincipalVariante
} = require('./productosController');

const {
  verificarTokenMiddleware,
  verificarRol
} = require('../../middleware/authMiddleware');

const { subirImagenProducto } = require('../../middleware/uploadMiddleware');

// -----------------------------------------------------
// CONFIGURACIÓN INICIAL
// -----------------------------------------------------
const router = Router();

// Roles con permisos de gestión
const rolesGestion = ['Administrador', 'Bodeguero'];
const middlewareGestion = [
  verificarTokenMiddleware,
  verificarRol(rolesGestion)
];

// =====================================================
// RUTAS PÚBLICAS – CONSULTA
// =====================================================

/**
 * Obtener productos con filtros y paginación
 * GET /api/productos
 */
router.get('/', obtenerTodosLosProductos);

/**
 * Obtener un producto por ID (con variantes e imágenes)
 * GET /api/productos/:id
 */
router.get('/:id', obtenerProductoPorId);

/**
 * Buscar producto por código (SKU / referencia)
 * GET /api/productos/codigo/:codigo
 */
router.get('/codigo/:codigo', obtenerProductoPorCodigo);

/**
 * Obtener productos por categoría
 * GET /api/productos/categoria/:idCategoria
 */
router.get('/categoria/:idCategoria', obtenerProductosPorCategoria);

/**
 * Obtener productos por proveedor
 * GET /api/productos/proveedor/:idProveedor
 */
router.get('/proveedor/:idProveedor', obtenerProductosPorProveedor);

/**
 * Obtener variantes de un producto
 * GET /api/productos/:id/variantes
 */
router.get('/:id/variantes', obtenerVariantesPorProducto);

// =====================================================
// RUTAS DE INVENTARIO (PROTEGIDAS)
// =====================================================

/**
 * Obtener productos sin stock
 * GET /api/productos/inventario/sin-stock
 */
router.get(
  '/inventario/sin-stock',
  middlewareGestion,
  obtenerProductosSinStock
);

/**
 * Obtener productos con stock bajo
 * GET /api/productos/inventario/stock-bajo
 */
router.get(
  '/inventario/stock-bajo',
  middlewareGestion,
  obtenerProductosConStockBajo
);

// =====================================================
// RUTAS DE IMÁGENES (PROTEGIDAS)
// =====================================================

/**
 * Obtener productos sin imágenes
 * GET /api/productos/sin-imagenes
 */
router.get(
  '/sin-imagenes',
  middlewareGestion,
  obtenerProductosSinImagenes
);

/**
 * Cambiar imagen principal de una variante
 * PUT /api/productos/variantes/:idVariante/imagen-principal/:idImagen
 */
router.put(
  '/variantes/:idVariante/imagen-principal/:idImagen',
  middlewareGestion,
  cambiarImagenPrincipalVariante
);

/**
 * Subir imagen de producto
 * POST /api/productos/upload
 */
router.post('/upload', middlewareGestion, subirImagenProducto, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      mensaje: 'No se ha subido ninguna imagen'
    });
  }

  const urlImagen = `/uploads/productos/${req.file.filename}`;
  res.status(200).json({
    mensaje: 'Imagen subida exitosamente',
    url: urlImagen,
    filename: req.file.filename
  });
});

// =====================================================
// RUTAS DE GESTIÓN DE PRODUCTOS (PROTEGIDAS)
// =====================================================

/**
 * Crear producto base
 * POST /api/productos
 */
router.post('/', middlewareGestion, crearProducto);

/**
 * Actualizar producto
 * PUT /api/productos/:id
 */
router.put('/:id', middlewareGestion, actualizarProducto);

/**
 * Eliminar producto (soft delete)
 * DELETE /api/productos/:id
 */
router.delete('/:id', middlewareGestion, eliminarProducto);

// =====================================================
// RUTAS DE VARIANTES (PROTEGIDAS)
// =====================================================

/**
 * Crear variante de un producto
 * POST /api/productos/:id/variantes
 */
router.post(
  '/:id/variantes',
  middlewareGestion,
  crearVarianteProducto
);

/**
 * Actualizar variante
 * PUT /api/productos/variantes/:idVariante
 */
router.put(
  '/variantes/:idVariante',
  middlewareGestion,
  actualizarVarianteProducto
);

/**
 * Eliminar variante (soft delete)
 * DELETE /api/productos/variantes/:idVariante
 */
router.delete(
  '/variantes/:idVariante',
  middlewareGestion,
  eliminarVarianteProducto
);

// -----------------------------------------------------
// EXPORTACIÓN
// -----------------------------------------------------
module.exports = router;
