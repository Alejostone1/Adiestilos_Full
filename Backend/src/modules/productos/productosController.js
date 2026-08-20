/**
 * =====================================================
 * CONTROLADOR DE PRODUCTOS
 * =====================================================
 * Responsable de:
 *  - Recibir las solicitudes HTTP
 *  - Validar y extraer parámetros
 *  - Delegar la lógica al service
 *  - Estandarizar las respuestas
 *
 * NO contiene lógica de negocio.
 * =====================================================
 */

// -----------------------------------------------------
// IMPORTACIONES
// -----------------------------------------------------
const productosService = require('./productosService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaPaginada
} = require('../../utils/responseHelper');

const { capturarErroresAsync } = require('../../utils/errorHelper');

// =====================================================
// PRODUCTOS
// =====================================================

/**
 * Obtener listado de productos con filtros y paginación.
 * @route   GET /api/productos
 * @query   pagina, limite, nombre, idCategoria, idProveedor
 */
const obtenerTodosLosProductos = capturarErroresAsync(async (req, res) => {
  const {
    pagina = 1,
    limite = 12,
    nombre,
    idCategoria,
    idProveedor,
    estado // Añadir estado
  } = req.query;

  const resultado = await productosService.obtenerTodos(
    { nombre, idCategoria, idProveedor, estado }, // Pasar estado al servicio
    { pagina, limite }
  );

  res.status(200).json(
    respuestaPaginada(
      resultado.datos,
      resultado.paginacion,
      'Productos obtenidos correctamente.'
    )
  );
});

/**
 * Obtener un producto por ID con variantes e imágenes.
 * @route GET /api/productos/:id
 */
const obtenerProductoPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;

  const producto = await productosService.obtenerPorId(id);

  res.status(200).json(
    respuestaExitosa(producto, 'Producto obtenido correctamente.')
  );
});

/**
 * Crear un producto base (SIN variantes).
 * Las variantes se crean en endpoints separados.
 * @route POST /api/productos
 */
const crearProducto = capturarErroresAsync(async (req, res) => {
  const producto = await productosService.crear(req.body);

  res.status(201).json(
    respuestaCreada(producto, 'Producto creado correctamente.')
  );
});

/**
 * Actualizar datos generales del producto.
 * @route PUT /api/productos/:id
 */
const actualizarProducto = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;

  const producto = await productosService.actualizar(id, req.body);

  res.status(200).json(
    respuestaExitosa(producto, 'Producto actualizado correctamente.')
  );
});

/**
 * Eliminar un producto (borrado lógico).
 * @route DELETE /api/productos/:id
 */
const eliminarProducto = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;

  const resultado = await productosService.eliminar(id);

  res.status(200).json(
    respuestaExitosa(resultado, 'Producto descontinuado correctamente.')
  );
});

/**
 * Buscar producto por código (SKU de variante).
 * @route GET /api/productos/codigo/:codigo
 */
const obtenerProductoPorCodigo = capturarErroresAsync(async (req, res) => {
  const { codigo } = req.params;

  const producto = await productosService.buscarPorCodigo(codigo);

  res.status(200).json(
    respuestaExitosa(producto, 'Producto encontrado por código.')
  );
});

/**
 * Obtener productos por categoría.
 * @route GET /api/productos/categoria/:idCategoria
 */
const obtenerProductosPorCategoria = capturarErroresAsync(async (req, res) => {
  const { idCategoria } = req.params;

  const productos = await productosService.obtenerPorCategoria(idCategoria);

  res.status(200).json(
    respuestaExitosa(productos, 'Productos obtenidos por categoría.')
  );
});

/**
 * Obtener productos por proveedor.
 * @route GET /api/productos/proveedor/:idProveedor
 */
const obtenerProductosPorProveedor = capturarErroresAsync(async (req, res) => {
  const { idProveedor } = req.params;

  const productos = await productosService.obtenerPorProveedor(idProveedor);

  res.status(200).json(
    respuestaExitosa(productos, 'Productos obtenidos por proveedor.')
  );
});

// =====================================================
// VARIANTES
// =====================================================

/**
 * Obtener variantes de un producto.
 * @route GET /api/productos/:id/variantes
 */
const obtenerVariantesPorProducto = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;

  const variantes = await productosService.obtenerVariantesPorProducto(id);

  res.status(200).json(
    respuestaExitosa(variantes, 'Variantes obtenidas correctamente.')
  );
});

/**
 * Crear una variante para un producto.
 * @route POST /api/productos/:id/variantes
 */
const crearVarianteProducto = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;

  const variante = await productosService.crearVarianteProducto(id, req.body);

  res.status(201).json(
    respuestaCreada(variante, 'Variante creada correctamente.')
  );
});

/**
 * Actualizar una variante.
 * @route PUT /api/variantes/:idVariante
 */
const actualizarVarianteProducto = capturarErroresAsync(async (req, res) => {
  const { idVariante } = req.params;

  const variante = await productosService.actualizarVarianteProducto(
    idVariante,
    req.body
  );

  res.status(200).json(
    respuestaExitosa(variante, 'Variante actualizada correctamente.')
  );
});

/**
 * Eliminar (soft delete) una variante.
 * @route DELETE /api/variantes/:idVariante
 */
const eliminarVarianteProducto = capturarErroresAsync(async (req, res) => {
  const { idVariante } = req.params;

  const resultado = await productosService.eliminarVarianteProducto(idVariante);

  res.status(200).json(
    respuestaExitosa(resultado, 'Variante eliminada correctamente.')
  );
});

// =====================================================
// INVENTARIO
// =====================================================

/**
 * Obtener productos sin stock.
 * @route GET /api/productos/inventario/sin-stock
 */
const obtenerProductosSinStock = capturarErroresAsync(async (req, res) => {
  const productos = await productosService.obtenerProductosSinStock();

  res.status(200).json(
    respuestaExitosa(productos, 'Productos sin stock.')
  );
});

/**
 * Obtener productos con stock bajo.
 * @route GET /api/productos/inventario/stock-bajo
 * @query limite
 */
const obtenerProductosConStockBajo = capturarErroresAsync(async (req, res) => {
  const { limite = 5 } = req.query;

  const productos = await productosService.obtenerProductosConStockBajo(limite);

  res.status(200).json(
    respuestaExitosa(productos, 'Productos con stock bajo.')
  );
});

// =====================================================
// IMÁGENES
// =====================================================

/**
 * Obtener productos sin imágenes.
 * @route GET /api/productos/sin-imagenes
 */
const obtenerProductosSinImagenes = capturarErroresAsync(async (req, res) => {
  const productos = await productosService.obtenerProductosSinImagenes();

  res.status(200).json(
    respuestaExitosa(productos, 'Productos sin imágenes.')
  );
});

/**
 * Cambiar imagen principal de una variante.
 * @route PUT /api/variantes/:idVariante/imagen-principal/:idImagen
 */
const cambiarImagenPrincipalVariante = capturarErroresAsync(async (req, res) => {
  const { idVariante, idImagen } = req.params;

  const resultado =
    await productosService.cambiarImagenPrincipalVariante(idVariante, idImagen);

  res.status(200).json(
    respuestaExitosa(resultado, 'Imagen principal actualizada.')
  );
});

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
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
};