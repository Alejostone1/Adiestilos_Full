/**
 * Controladores de rutas públicas para el e-commerce
 */

const publicService = require('./publicService');

/**
 * GET /api/public/categorias
 */
async function listarCategorias(req, res, next) {
  try {
    const categorias = await publicService.obtenerCategoriasActivas();
    res.json({
      exito: true,
      datos: categorias
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/categorias/:idOSlug
 */
async function obtenerCategoria(req, res, next) {
  try {
    const { idOSlug } = req.params;
    const categoria = await publicService.obtenerCategoriaPorSlug(idOSlug);
    
    if (!categoria) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Categoría no encontrada'
      });
    }

    res.json({
      exito: true,
      datos: categoria
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/categorias/:id/productos
 */
async function listarProductosCategoria(req, res, next) {
  try {
    const { id } = req.params;
    const { pagina, limite, orden } = req.query;
    
    const resultado = await publicService.obtenerProductosPorCategoria(id, {
      pagina,
      limite,
      orden
    });

    res.json({
      exito: true,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/productos/destacados
 */
async function listarProductosDestacados(req, res, next) {
  try {
    const { limite } = req.query;
    const productos = await publicService.obtenerProductosDestacados(limite);
    
    res.json({
      exito: true,
      datos: productos
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/productos/:id
 * Retorna el producto directamente (no envuelto en 'datos') para facilitar el uso en frontend
 */
async function obtenerProducto(req, res, next) {
  try {
    const { id } = req.params;
    const producto = await publicService.obtenerProductoDetalle(id);
    
    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }

    res.json(producto);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/productos/:id/variantes
 */
async function listarVariantesProducto(req, res, next) {
  try {
    const { id } = req.params;
    const variantes = await publicService.obtenerVariantesProducto(id);
    
    res.json({
      exito: true,
      datos: variantes
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/buscar
 */
async function buscarProductos(req, res, next) {
  try {
    const { q, pagina, limite, idCategoria, precioMin, precioMax } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        exito: false,
        mensaje: 'El término de búsqueda es requerido'
      });
    }

    const resultado = await publicService.buscarProductos(q, {
      pagina,
      limite,
      idCategoria,
      precioMin,
      precioMax
    });

    res.json({
      exito: true,
      termino: q,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/productos
 */
async function listarProductos(req, res, next) {
  try {
    const { pagina, limite, orden, idCategoria, precioMin, precioMax } = req.query;

    const resultado = await publicService.obtenerProductosPublicos({
      pagina,
      limite,
      orden,
      idCategoria,
      precioMin,
      precioMax
    });

    res.json({
      exito: true,
      ...resultado
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarCategorias,
  obtenerCategoria,
  listarProductosCategoria,
  listarProductosDestacados,
  listarProductos,
  obtenerProducto,
  listarVariantesProducto,
  buscarProductos
};
