/**
 * Servicio para la lógica de negocio de Inventario.
 * Maneja la consulta de stock, historial de movimientos y estadísticas.
 *
 * NOTA: Este servicio NO modifica stock directamente. Solo consulta información.
 * Las modificaciones de stock se hacen únicamente a través de movimientos_inventario.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const {
  ErrorNoEncontrado,
  ErrorValidacion
} = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene el stock actual de las variantes de productos con filtros y paginación.
 * @param {object} [filtros={}] - Opciones de filtrado (idProducto, stockBajo, sinStock).
 * @param {object} [paginacion] - Opciones de paginación.
 * @returns {Promise<object>} Objeto con la lista de variantes y su stock.
 */
async function obtenerStock(filtros = {}, paginacion = { pagina: 1, limite: 15 }) {
  const { idProducto, stockBajo, sinStock } = filtros;
  const { pagina, limite } = paginacion;
  const skip = (Number(pagina) - 1) * Number(limite);

  // Construir filtros dinámicos
  let where = {
    estado: 'activo' // Solo productos activos
  };

  if (idProducto) {
    where.idProducto = Number(idProducto);
  }

  if (sinStock) {
    where.cantidadStock = { equals: 0 };
  }

  // Para stock bajo, usamos la API de Prisma (compatible MySQL/PostgreSQL)
  if (stockBajo && !sinStock) {
    const whereBajoStock = {
      estado: 'activo',
      stockMinimo: { gt: 0 },
      cantidadStock: { lte: prisma.varianteProducto.fields.stockMinimo }
    };

    if (idProducto) {
      whereBajoStock.idProducto = Number(idProducto);
    }

    const [variantesBajoStock, totalBajoStock] = await prisma.$transaction([
      prisma.varianteProducto.findMany({
        where: whereBajoStock,
        include: {
          producto: { select: { nombreProducto: true, codigoReferencia: true } },
          color: { select: { nombreColor: true } },
          talla: { select: { nombreTalla: true } }
        },
        orderBy: { producto: { nombreProducto: 'asc' } },
        skip,
        take: Number(limite)
      }),
      prisma.varianteProducto.count({ where: whereBajoStock })
    ]);

    return {
      datos: variantesBajoStock,
      paginacion: {
        totalRegistros: totalBajoStock,
        paginaActual: Number(pagina),
        totalPaginas: Math.ceil(totalBajoStock / limite),
        registrosPorPagina: Number(limite)
      }
    };
  }

  // Ejecutar consulta con paginación
  const [variantes, total] = await prisma.$transaction([
    prisma.varianteProducto.findMany({
      where,
      include: {
        producto: {
          include: {
            categoria: { select: { nombreCategoria: true } },
            proveedor: { select: { nombreProveedor: true } },
            imagenes: { select: { rutaImagen: true, esPrincipal: true } }
          }
        },
        color: { select: { nombreColor: true } },
        talla: { select: { nombreTalla: true } },
        imagenesVariantes: { select: { rutaImagen: true, esPrincipal: true } }
      },
      skip,
      take: Number(limite),
      orderBy: { producto: { nombreProducto: 'asc' } }
    }),
    prisma.varianteProducto.count({ where })
  ]);

  return {
    datos: variantes,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene estadísticas generales del inventario.
 * @returns {Promise<object>} Estadísticas del inventario.
 */
async function obtenerEstadisticasInventario() {
  try {
    // Obtener todas las variantes activas
    const variantes = await prisma.varianteProducto.findMany({
      where: { estado: 'activo' },
      select: {
        cantidadStock: true,
        stockMinimo: true,
        precioCosto: true
      }
    });

  const totalProductos = variantes.length;
  let productosBajoStock = 0;
  let productosSinStock = 0;
  let valorTotalInventario = 0;

  console.log('Calculando estadísticas...');
  for (const variante of variantes) {
    // Convertir Decimal a Number para evitar problemas de comparación
    const cantidadStock = Number(variante.cantidadStock);
    const stockMinimo = Number(variante.stockMinimo);
    const precioCosto = Number(variante.precioCosto);

    // Calcular stock bajo
    if (stockMinimo > 0 && cantidadStock <= stockMinimo) {
      productosBajoStock++;
    }

    // Calcular sin stock
    if (cantidadStock === 0) {
      productosSinStock++;
    }

    // Calcular valor total
    const valorVariante = precioCosto * cantidadStock;
    valorTotalInventario += valorVariante;
  }

  return {
    totalProductos,
    productosBajoStock,
    productosSinStock,
    valorTotalInventario
  };
  } catch (error) {
    console.error('Error al obtener estadísticas de inventario:', error);
    throw error;
  }
}

/**
 * Obtiene el stock de una variante específica.
 * @param {number} idVariante - ID de la variante.
 * @returns {Promise<object>} Información del stock de la variante.
 */
async function obtenerStockVariante(idVariante) {
  const variante = await prisma.varianteProducto.findUnique({
    where: { idVariante: Number(idVariante) },
    include: {
      producto: { select: { nombreProducto: true, codigoReferencia: true } },
      color: { select: { nombreColor: true } },
      talla: { select: { nombreTalla: true } }
    }
  });

  if (!variante) {
    throw new ErrorNoEncontrado(`Variante con ID ${idVariante} no encontrada.`);
  }

  return {
    idVariante: variante.idVariante,
    codigoSku: variante.codigoSku,
    nombreProducto: variante.producto.nombreProducto,
    color: variante.color?.nombreColor,
    talla: variante.talla?.nombreTalla,
    cantidadStock: variante.cantidadStock,
    stockMinimo: variante.stockMinimo,
    stockMaximo: variante.stockMaximo,
    precioCosto: variante.precioCosto,
    precioVenta: variante.precioVenta,
    estado: variante.estado
  };
}

/**
 * Obtiene un historial paginado de movimientos de inventario.
 * @param {object} [filtros={}] - Opciones de filtrado (idVariante, idTipoMovimiento, fechaInicio, fechaFin).
 * @param {object} [paginacion] - Opciones de paginación.
 * @returns {Promise<object>} Objeto con la lista de movimientos y paginación.
 */
async function obtenerMovimientos(filtros = {}, paginacion = { pagina: 1, limite: 20 }) {
  const { idVariante, idTipoMovimiento, fechaInicio, fechaFin } = filtros;
  const { pagina, limite } = paginacion;
  const skip = (Number(pagina) - 1) * Number(limite);

  // Construir filtros dinámicos
  const where = {
    AND: [
      idVariante && { idVariante: Number(idVariante) },
      idTipoMovimiento && { idTipoMovimiento: Number(idTipoMovimiento) },
      fechaInicio && { fechaMovimiento: { gte: new Date(fechaInicio) } },
      fechaFin && { fechaMovimiento: { lte: new Date(fechaFin) } }
    ].filter(Boolean)
  };

  // Ejecutar consulta con paginación
  const [movimientos, total] = await prisma.$transaction([
    prisma.movimientoInventario.findMany({
      where,
      include: {
        variante: {
          include: {
            producto: { select: { nombreProducto: true, codigoReferencia: true } },
            color: { select: { nombreColor: true } },
            talla: { select: { nombreTalla: true } }
          }
        },
        tipoMovimiento: { select: { nombreTipo: true, tipo: true } },
        usuarioRegistroRef: { select: { usuario: true, nombres: true, apellidos: true } },
        compra: { select: { numeroCompra: true } },
        venta: { select: { numeroFactura: true } },
        ajuste: { select: { numeroAjuste: true } }
      },
      skip,
      take: Number(limite),
      orderBy: { fechaMovimiento: 'desc' }
    }),
    prisma.movimientoInventario.count({ where })
  ]);

  return {
    datos: movimientos,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite)
    }
  };
}

// --- EXPORTACIÓN ---
module.exports = {
  obtenerStock,
  obtenerEstadisticasInventario,
  obtenerStockVariante,
  obtenerMovimientos,
};
