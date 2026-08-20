/**
 * =====================================================
 * SERVICIO DE PRODUCTOS
 * =====================================================
 * Contiene toda la lógica de negocio del módulo:
 *  - Productos
 *  - Variantes (CRÍTICO)
 *  - Inventario
 *  - Imágenes
 *  - Filtros, paginación
 * =====================================================
 */

const { prisma } = require('../../config/databaseConfig');

// =====================================================
// UTILIDADES INTERNAS
// =====================================================

/**
 * Construye filtros dinámicos para Prisma
 */
const construirFiltros = (filtros) => {
  const where = {};

  if (filtros.estado && ['activo', 'inactivo', 'descontinuado'].includes(filtros.estado)) {
    where.estado = filtros.estado;
  } else {
    where.estado = 'activo'; // Default to active products if no specific state is requested
  }

  if (filtros.nombre && filtros.nombre.trim() !== '') {
    // Assuming 'nombreProducto' is the field in the 'Producto' model
    where.nombreProducto = { contains: filtros.nombre, mode: 'insensitive' };
  }

  if (filtros.idCategoria) {
    const idCategoriaNum = parseInt(filtros.idCategoria, 10);
    if (!isNaN(idCategoriaNum)) {
      where.idCategoria = idCategoriaNum;
    }
  }

  if (filtros.idProveedor) {
    const idProveedorNum = parseInt(filtros.idProveedor, 10);
    if (!isNaN(idProveedorNum)) {
      where.idProveedor = idProveedorNum;
    }
  }

  // 'destacado' no existe en el esquema actualizado

  return where;
};


/**
 * Calcula paginación
 */
const construirPaginacion = (pagina, limite, total) => {
  const page = Number(pagina);
  const limit = Number(limite);

  return {
    paginaActual: page,
    totalPaginas: Math.ceil(total / limit),
    totalRegistros: total,
    registrosPorPagina: limit
  };
};

// =====================================================
// PRODUCTOS
// =====================================================

/**
 * Obtener productos con variantes, imágenes y paginación
 */
const obtenerTodos = async (filtros, { pagina = 1, limite = 12 }) => {
  const where = construirFiltros(filtros);

  const skip = (pagina - 1) * limite;

  const [productos, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      select: {
        idProducto: true,
        nombreProducto: true,
        codigoReferencia: true,
        descripcion: true,
        creadoEn: true,
        actualizadoEn: true,
        estado: true,
        precioVentaSugerido: true,
        tieneColores: true,
        tieneTallas: true,
        idCategoria: true,
        idProveedor: true,
        categoria: {
          select: {
            nombreCategoria: true
          }
        },
        proveedor: {
          select: {
            nombreProveedor: true
          }
        },
        imagenes: {
          select: {
            idImagen: true,
            rutaImagen: true,
            esPrincipal: true
          },
          orderBy: {
            orden: 'asc'
          }
        },
        variantes: {
          where: { estado: 'activo' },
          select: {
            idVariante: true,
            cantidadStock: true,
            precioCosto: true,
            precioVenta: true,
            codigoSku: true,
            color: {
              select: {
                idColor: true,
                nombreColor: true,
                codigoHex: true
              }
            },
            talla: {
              select: {
                idTalla: true,
                nombreTalla: true
              }
            },
            imagenesVariantes: {
              where: { esPrincipal: true },
              take: 1,
              select: {
                idImagenVariante: true,
                rutaImagen: true
              }
            }
          }
        }
      },
      orderBy: { creadoEn: 'desc' },
      skip,
      take: Number(limite)
    }),
    prisma.producto.count({ where })
  ]);

  const productosFormateados = productos.map(p => ({
    ...p,
    precioVentaSugerido: Number(p.precioVentaSugerido),
    imagenPrincipal: p.imagenes.find(img => img.esPrincipal)?.rutaImagen || p.imagenes[0]?.rutaImagen || null,
    variantes: p.variantes.map(v => {
      const precioCosto = Number(v.precioCosto);
      const precioVenta = Number(v.precioVenta);
      const margen = precioVenta - precioCosto;
      const margenPorcentaje = precioVenta > 0 ? Number(((margen / precioVenta) * 100).toFixed(2)) : 0;

      return {
        ...v,
        precioCosto,
        precioVenta,
        cantidadStock: Number(v.cantidadStock),
        margen,
        margenPorcentaje
      };
    })
  }));

  return {
    datos: productosFormateados,
    paginacion: construirPaginacion(pagina, limite, total)
  };
};

/**
 * Obtener producto por ID (con variantes completas)
 */
const obtenerPorId = async (idProducto) => {
  const producto = await prisma.producto.findFirst({
    where: {
      idProducto: Number(idProducto),
      estado: 'activo'
    },
    include: {
      categoria: true,
      proveedor: true,
      variantes: {
        where: { estado: 'activo' },
        include: {
          color: true,
          talla: true,
          imagenesVariantes: true
        }
      },
      imagenes: true
    }
  });

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  // Enriquecer variantes con cálculo de margen
  const variantesEnriquecidas = producto.variantes.map(v => {
    const precioCosto = Number(v.precioCosto);
    const precioVenta = Number(v.precioVenta);
    const margen = precioVenta - precioCosto;
    const margenPorcentaje = precioVenta > 0 ? Number(((margen / precioVenta) * 100).toFixed(2)) : 0;

    return {
      ...v,
      precioCosto,
      precioVenta,
      cantidadStock: Number(v.cantidadStock),
      margen,
      margenPorcentaje
    };
  });

  return {
    ...producto,
    precioVentaSugerido: Number(producto.precioVentaSugerido),
    variantes: variantesEnriquecidas
  };
};

/**
 * Crear producto base con su imagen principal inicial
 */
const crear = async (data) => {
  const { imagenPrincipal, ...productoBasico } = data;

  return prisma.producto.create({
    data: {
      nombreProducto: productoBasico.nombreProducto,
      codigoReferencia: productoBasico.codigoReferencia,
      descripcion: productoBasico.descripcion,
      precioVentaSugerido: productoBasico.precioVentaSugerido,
      idCategoria: Number(productoBasico.idCategoria),
      idProveedor: productoBasico.idProveedor ? Number(productoBasico.idProveedor) : null,
      unidadMedida: productoBasico.unidadMedida || 'unidad',
      tieneColores: !!productoBasico.tieneColores,
      tieneTallas: !!productoBasico.tieneTallas,
      estado: productoBasico.estado || 'activo',
      // Crear imagen principal si se proporciona
      ...(imagenPrincipal && {
        imagenes: {
          create: {
            rutaImagen: imagenPrincipal,
            esPrincipal: true,
            orden: 0,
            descripcion: `Imagen principal de ${productoBasico.nombreProducto}`
          }
        }
      })
    },
    include: {
      imagenes: true,
      categoria: true,
      proveedor: true
    }
  });
};

/**
 * Actualizar producto y su imagen principal
 */
const actualizar = async (idProducto, data) => {
  const { imagenPrincipal, ...productoBasico } = data;
  const id = Number(idProducto);

  // 1. Si hay una nueva imagen principal, gestionar el cambio
  if (imagenPrincipal) {
    // Desmarcar otras como principales
    await prisma.imagenProducto.updateMany({
      where: { idProducto: id },
      data: { esPrincipal: false }
    });

    // Buscar si ya existe esta ruta o crear una nueva entrada
    const imagenExistente = await prisma.imagenProducto.findFirst({
      where: { idProducto: id, rutaImagen: imagenPrincipal }
    });

    if (imagenExistente) {
      await prisma.imagenProducto.update({
        where: { idImagen: imagenExistente.idImagen },
        data: { esPrincipal: true }
      });
    } else {
      await prisma.imagenProducto.create({
        data: {
          idProducto: id,
          rutaImagen: imagenPrincipal,
          esPrincipal: true,
          orden: 0
        }
      });
    }
  }

  // 2. Actualizar datos básicos
  return prisma.producto.update({
    where: { idProducto: id },
    data: {
      nombreProducto: productoBasico.nombreProducto,
      codigoReferencia: productoBasico.codigoReferencia,
      descripcion: productoBasico.descripcion,
      precioVentaSugerido: productoBasico.precioVentaSugerido,
      idCategoria: productoBasico.idCategoria ? Number(productoBasico.idCategoria) : undefined,
      idProveedor: productoBasico.idProveedor !== undefined ? (productoBasico.idProveedor ? Number(productoBasico.idProveedor) : null) : undefined,
      unidadMedida: productoBasico.unidadMedida,
      tieneColores: productoBasico.tieneColores !== undefined ? !!productoBasico.tieneColores : undefined,
      tieneTallas: productoBasico.tieneTallas !== undefined ? !!productoBasico.tieneTallas : undefined,
      estado: productoBasico.estado
    },
    include: {
      imagenes: true,
      categoria: true,
      proveedor: true
    }
  });
};

/**
 * Soft delete de producto
 */
const eliminar = async (idProducto) => {
  return prisma.producto.update({
    where: { idProducto: Number(idProducto) },
    data: { estado: 'descontinuado' }
  });
};

/**
 * Buscar producto por código (SKU base o variante)
 */
const buscarPorCodigo = async (codigo) => {
  const variante = await prisma.varianteProducto.findFirst({
    where: { codigoSku: codigo },
    include: {
      producto: true,
      imagenesVariantes: true
    }
  });

  if (!variante) {
    throw new Error('Producto no encontrado por código');
  }

  return variante;
};

/**
 * Productos por categoría
 */
const obtenerPorCategoria = async (idCategoria) => {
  return prisma.producto.findMany({
    where: {
      idCategoria: Number(idCategoria),
      estado: 'activo'
    },
    include: {
      variantes: {
        where: { estado: 'activo' },
        include: {
          color: true,
          talla: true,
          imagenesVariantes: true
        }
      },
      imagenes: true
    }
  });
};

/**
 * Productos por proveedor (con variantes completas para módulo de compras)
 */
const obtenerPorProveedor = async (idProveedor) => {
  return prisma.producto.findMany({
    where: {
      idProveedor: Number(idProveedor),
      estado: 'activo'
    },
    include: {
      categoria: true,
      variantes: {
        where: { estado: 'activo' },
        include: {
          color: true,
          talla: true,
          imagenesVariantes: {
            where: { esPrincipal: true },
            take: 1
          }
        }
      },
      imagenes: {
        where: { esPrincipal: true },
        take: 1
      }
    }
  });
};

// =====================================================
// VARIANTES (CRÍTICO)
// =====================================================

/**
 * Obtener variantes por producto
 */
const obtenerVariantesPorProducto = async (idProducto) => {
  return prisma.varianteProducto.findMany({
    where: {
      idProducto: Number(idProducto),
      estado: 'activo'
    },
    include: {
      color: true,
      talla: true,
      imagenesVariantes: true
    }
  });
};

/**
 * Crear variante de producto
 */
const crearVarianteProducto = async (idProducto, data) => {
    return prisma.varianteProducto.create({
      data: {
        idProducto: Number(idProducto),
        codigoSku: data.codigoSku,
        precioVenta: data.precioVenta,
        cantidadStock: data.cantidadStock,
        idColor: data.idColor,
        idTalla: data.idTalla,
      }
    });
};

/**
 * Actualizar variante
 */
const actualizarVarianteProducto = async (idVariante, data) => {
  return prisma.varianteProducto.update({
    where: { idVariante: Number(idVariante) },
    data
  });
};

/**
 * Eliminar variante (soft delete)
 */
const eliminarVarianteProducto = async (idVariante) => {
  return prisma.varianteProducto.update({
    where: { idVariante: Number(idVariante) },
    data: { estado: 'inactivo' }
  });
};

// =====================================================
// INVENTARIO
// =====================================================

/**
 * Productos sin stock
 */
const obtenerProductosSinStock = async () => {
  return prisma.varianteProducto.findMany({
    where: { cantidadStock: 0, estado: 'activo' },
    include: { producto: true }
  });
};

/**
 * Productos con stock bajo
 */
const obtenerProductosConStockBajo = async (limite = 5) => {
  return prisma.varianteProducto.findMany({
    where: {
      cantidadStock: { lte: limite },
      estado: 'activo'
    },
    include: { producto: true }
  });
};

// =====================================================
// IMÁGENES
// =====================================================

/**
 * Productos sin imágenes
 */
const obtenerProductosSinImagenes = async () => {
  return prisma.producto.findMany({
    where: {
      imagenes: { none: {} },
      estado: 'activo'
    }
  });
};

/**
 * Cambiar imagen principal de una variante
 */
const cambiarImagenPrincipalVariante = async (idVariante, idImagen) => {
  await prisma.imagenVariante.updateMany({
    where: { idVariante: Number(idVariante) },
    data: { esPrincipal: false }
  });

  return prisma.imagenVariante.update({
    where: { idImagenVariante: Number(idImagen) },
    data: { esPrincipal: true }
  });
};

// =====================================================
// EXPORTACIÓN
// =====================================================

module.exports = {
  // Productos
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  buscarPorCodigo,
  obtenerPorCategoria,
  obtenerPorProveedor,

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