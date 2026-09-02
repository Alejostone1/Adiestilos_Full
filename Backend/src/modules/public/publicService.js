/**
 * Servicio de rutas públicas para el e-commerce
 * Sin autenticación requerida
 */

const { prisma } = require('../../config/databaseConfig');

/**
 * Convierte un nombre a slug
 */
const generarSlug = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Obtiene todas las categorías activas con subcategorías
 */
async function obtenerCategoriasActivas() {
  const categorias = await prisma.categoria.findMany({
    where: {
      estado: 'activo',
      categoriaPadre: null
    },
    select: {
      idCategoria: true,
      nombreCategoria: true,
      descripcion: true,
      imagenCategoria: true,
      _count: { select: { productos: true } },
      subcategorias: {
        where: { estado: 'activo' },
        select: {
          idCategoria: true,
          nombreCategoria: true,
          descripcion: true,
          imagenCategoria: true,
          _count: { select: { productos: true } }
        },
        orderBy: { nombreCategoria: 'asc' }
      }
    },
    orderBy: { nombreCategoria: 'asc' }
  });

  return categorias.map(cat => {
    const subcategorias = cat.subcategorias.map(sub => ({
      ...sub,
      cantidadProductos: sub._count.productos,
      slug: generarSlug(sub.nombreCategoria)
    }));
    const totalProductos = cat._count.productos + subcategorias.reduce((s, sub) => s + sub.cantidadProductos, 0);
    return {
      idCategoria: cat.idCategoria,
      nombreCategoria: cat.nombreCategoria,
      descripcion: cat.descripcion,
      imagenCategoria: cat.imagenCategoria,
      cantidadProductos: totalProductos,
      slug: generarSlug(cat.nombreCategoria),
      subcategorias
    };
  });
}

/**
 * Busca una categoría por ID o slug
 */
async function obtenerCategoriaPorSlug(idOSlug) {
  const idNumerico = parseInt(idOSlug, 10);
  
  let categoria;
  
  if (!isNaN(idNumerico)) {
    categoria = await prisma.categoria.findFirst({
      where: {
        idCategoria: idNumerico,
        estado: 'activo'
      },
      select: {
        idCategoria: true,
        nombreCategoria: true,
        descripcion: true,
        imagenCategoria: true,
        subcategorias: {
          where: { estado: 'activo' },
          select: {
            idCategoria: true,
            nombreCategoria: true,
            imagenCategoria: true
          }
        },
        categoriaPadreRef: {
          select: {
            idCategoria: true,
            nombreCategoria: true
          }
        }
      }
    });
  } else {
    const categorias = await prisma.categoria.findMany({
      where: { estado: 'activo' },
      select: {
        idCategoria: true,
        nombreCategoria: true,
        descripcion: true,
        imagenCategoria: true,
        subcategorias: {
          where: { estado: 'activo' },
          select: {
            idCategoria: true,
            nombreCategoria: true,
            imagenCategoria: true
          }
        },
        categoriaPadreRef: {
          select: {
            idCategoria: true,
            nombreCategoria: true
          }
        }
      }
    });
    
    categoria = categorias.find(c => generarSlug(c.nombreCategoria) === idOSlug);
  }

  if (!categoria) {
    return null;
  }

  return {
    ...categoria,
    slug: generarSlug(categoria.nombreCategoria)
  };
}

/**
 * Obtiene productos destacados (más recientes)
 */
async function obtenerProductosDestacados(limite = 12) {
  const productos = await prisma.producto.findMany({
    where: { estado: 'activo' },
    select: {
      idProducto: true,
      nombreProducto: true,
      codigoReferencia: true,
      descripcion: true,
      precioVentaSugerido: true,
      imagenes: {
        where: { esPrincipal: true },
        take: 1,
        select: { rutaImagen: true }
      },
      tieneColores: true,
      tieneTallas: true,
      creadoEn: true,
      categoria: {
        select: {
          idCategoria: true,
          nombreCategoria: true
        }
      },
      variantes: {
        where: { estado: 'activo' },
        select: {
          idVariante: true,
          precioVenta: true,
          cantidadStock: true,
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
          }
        }
      }
    },
    orderBy: { creadoEn: 'desc' },
    take: Number(limite)
  });

  return productos.map(p => {
    const coloresUnicos = [];
    const tallasUnicas = [];
    
    p.variantes.forEach(v => {
      if (v.color && !coloresUnicos.find(c => c.idColor === v.color.idColor)) {
        coloresUnicos.push(v.color);
      }
      if (v.talla && !tallasUnicas.find(t => t.idTalla === v.talla.idTalla)) {
        tallasUnicas.push(v.talla);
      }
    });

    return {
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      codigoReferencia: p.codigoReferencia,
      descripcion: p.descripcion,
      precioVentaSugerido: Number(p.precioVentaSugerido),
      imagenPrincipal: p.imagenes[0]?.rutaImagen || null,
      tieneColores: p.tieneColores,
      tieneTallas: p.tieneTallas,
      creadoEn: p.creadoEn,
      categoria: p.categoria,
      stockTotal: p.variantes.reduce((sum, v) => sum + Number(v.cantidadStock), 0),
      precioMinimo: p.variantes.length > 0 
        ? Math.min(...p.variantes.map(v => Number(v.precioVenta)))
        : Number(p.precioVentaSugerido),
      cantidadVariantes: p.variantes.length,
      coloresDisponibles: coloresUnicos,
      tallasDisponibles: tallasUnicas
    };
  });
}

/**
 * Obtiene productos por categoría con paginación
 */
async function obtenerProductosPorCategoria(idCategoria, opciones = {}) {
  const { pagina = 1, limite = 12, orden = 'recientes' } = opciones;
  const skip = (Number(pagina) - 1) * Number(limite);

  const categoriasIds = [Number(idCategoria)];
  const subcategorias = await prisma.categoria.findMany({
    where: { categoriaPadre: Number(idCategoria), estado: 'activo' },
    select: { idCategoria: true }
  });
  subcategorias.forEach(sub => categoriasIds.push(sub.idCategoria));

  let orderBy = { creadoEn: 'desc' };
  if (orden === 'precio_asc') orderBy = { precioVentaSugerido: 'asc' };
  if (orden === 'precio_desc') orderBy = { precioVentaSugerido: 'desc' };
  if (orden === 'nombre') orderBy = { nombreProducto: 'asc' };

  const where = {
    idCategoria: { in: categoriasIds },
    estado: 'activo'
  };

  const [productos, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      select: {
        idProducto: true,
        nombreProducto: true,
        codigoReferencia: true,
        precioVentaSugerido: true,
        imagenes: {
          where: { esPrincipal: true },
          take: 1,
          select: { rutaImagen: true }
        },
        tieneColores: true,
        tieneTallas: true,
        variantes: {
          where: { estado: 'activo' },
          select: {
            precioVenta: true,
            cantidadStock: true,
            color: { select: { idColor: true, nombreColor: true, codigoHex: true } },
            talla: { select: { idTalla: true, nombreTalla: true } }
          }
        }
      },
      orderBy,
      skip,
      take: Number(limite)
    }),
    prisma.producto.count({ where })
  ]);

  const productosFormateados = productos.map(p => {
    const coloresUnicos = [];
    const tallasUnicas = [];
    
    p.variantes.forEach(v => {
      if (v.color && !coloresUnicos.find(c => c.idColor === v.color.idColor)) {
        coloresUnicos.push(v.color);
      }
      if (v.talla && !tallasUnicas.find(t => t.idTalla === v.talla.idTalla)) {
        tallasUnicas.push(v.talla);
      }
    });

    return {
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      codigoReferencia: p.codigoReferencia,
      precioVentaSugerido: Number(p.precioVentaSugerido),
      imagenPrincipal: p.imagenes[0]?.rutaImagen || null,
      tieneColores: p.tieneColores,
      tieneTallas: p.tieneTallas,
      stockTotal: p.variantes.reduce((sum, v) => sum + Number(v.cantidadStock), 0),
      precioMinimo: p.variantes.length > 0
        ? Math.min(...p.variantes.map(v => Number(v.precioVenta)))
        : Number(p.precioVentaSugerido),
      coloresDisponibles: coloresUnicos,
      tallasDisponibles: tallasUnicas
    };
  });

  return {
    datos: productosFormateados,
    paginacion: {
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
      totalRegistros: total,
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene el detalle completo de un producto
 */
async function obtenerProductoDetalle(idProducto) {
  const producto = await prisma.producto.findFirst({
    where: {
      idProducto: Number(idProducto),
      estado: 'activo'
    },
    select: {
      idProducto: true,
      nombreProducto: true,
      codigoReferencia: true,
      descripcion: true,
      precioVentaSugerido: true,
      tieneColores: true,
      tieneTallas: true,
      datosTecnicos: true,
      categoria: {
        select: {
          idCategoria: true,
          nombreCategoria: true,
          categoriaPadreRef: {
            select: {
              idCategoria: true,
              nombreCategoria: true
            }
          }
        }
      },
      imagenes: {
        select: {
          idImagen: true,
          rutaImagen: true,
          esPrincipal: true,
          orden: true
        },
        orderBy: { orden: 'asc' }
      },
      variantes: {
        where: { estado: 'activo' },
        select: {
          idVariante: true,
          codigoSku: true,
          precioVenta: true,
          cantidadStock: true,
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
              nombreTalla: true,
              tipoTalla: true
            }
          },
          imagenesVariantes: {
            select: {
              idImagenVariante: true,
              rutaImagen: true,
              esPrincipal: true,
              orden: true
            },
            orderBy: { orden: 'asc' }
          }
        }
      }
    }
  });

  if (!producto) {
    return null;
  }

  const coloresUnicos = [];
  const tallasUnicas = [];
  
  producto.variantes.forEach(v => {
    if (v.color && !coloresUnicos.find(c => c.idColor === v.color.idColor)) {
      coloresUnicos.push(v.color);
    }
    if (v.talla && !tallasUnicas.find(t => t.idTalla === v.talla.idTalla)) {
      tallasUnicas.push(v.talla);
    }
  });

  return {
    ...producto,
    imagenPrincipal: producto.imagenes.find(img => img.esPrincipal)?.rutaImagen || producto.imagenes[0]?.rutaImagen || null,
    precioVentaSugerido: Number(producto.precioVentaSugerido),
    stockTotal: producto.variantes.reduce((sum, v) => sum + Number(v.cantidadStock), 0),
    precioMinimo: producto.variantes.length > 0
      ? Math.min(...producto.variantes.map(v => Number(v.precioVenta)))
      : Number(producto.precioVentaSugerido),
    precioMaximo: producto.variantes.length > 0
      ? Math.max(...producto.variantes.map(v => Number(v.precioVenta)))
      : Number(producto.precioVentaSugerido),
    coloresDisponibles: coloresUnicos,
    tallasDisponibles: tallasUnicas,
    variantes: producto.variantes.map(v => ({
      ...v,
      precioVenta: Number(v.precioVenta),
      cantidadStock: Number(v.cantidadStock)
    }))
  };
}

/**
 * Obtiene las variantes de un producto
 */
async function obtenerVariantesProducto(idProducto) {
  const variantes = await prisma.varianteProducto.findMany({
    where: {
      idProducto: Number(idProducto),
      estado: 'activo'
    },
    select: {
      idVariante: true,
      codigoSku: true,
      precioVenta: true,
      cantidadStock: true,
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
          nombreTalla: true,
          tipoTalla: true
        }
      },
      imagenesVariantes: {
        select: {
          idImagenVariante: true,
          rutaImagen: true,
          esPrincipal: true
        },
        orderBy: { orden: 'asc' }
      }
    }
  });

  return variantes.map(v => ({
    ...v,
    precioVenta: Number(v.precioVenta),
    cantidadStock: Number(v.cantidadStock),
    disponible: Number(v.cantidadStock) > 0
  }));
}

/**
 * Busca productos por término
 */
async function buscarProductos(termino, opciones = {}) {
  const { pagina = 1, limite = 12, idCategoria, precioMin, precioMax } = opciones;
  const skip = (Number(pagina) - 1) * Number(limite);

  const where = {
    estado: 'activo',
    nombreProducto: { contains: termino }
  };

  if (idCategoria) {
    where.idCategoria = Number(idCategoria);
  }

  if (precioMin || precioMax) {
    where.precioVentaSugerido = {};
    if (precioMin) where.precioVentaSugerido.gte = Number(precioMin);
    if (precioMax) where.precioVentaSugerido.lte = Number(precioMax);
  }

  const [productos, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      select: {
        idProducto: true,
        nombreProducto: true,
        codigoReferencia: true,
        precioVentaSugerido: true,
        imagenes: {
          where: { esPrincipal: true },
          take: 1,
          select: { rutaImagen: true }
        },
        tieneColores: true,
        tieneTallas: true,
        categoria: {
          select: {
            idCategoria: true,
            nombreCategoria: true
          }
        },
        variantes: {
          where: { estado: 'activo' },
          select: {
            precioVenta: true,
            cantidadStock: true
          }
        }
      },
      orderBy: { nombreProducto: 'asc' },
      skip,
      take: Number(limite)
    }),
    prisma.producto.count({ where })
  ]);

  const productosFormateados = productos.map(p => ({
    idProducto: p.idProducto,
    nombreProducto: p.nombreProducto,
    codigoReferencia: p.codigoReferencia,
    precioVentaSugerido: Number(p.precioVentaSugerido),
    imagenPrincipal: p.imagenes[0]?.rutaImagen || null,
    tieneColores: p.tieneColores,
    tieneTallas: p.tieneTallas,
    categoria: p.categoria,
    stockTotal: p.variantes.reduce((sum, v) => sum + Number(v.cantidadStock), 0),
    precioMinimo: p.variantes.length > 0
      ? Math.min(...p.variantes.map(v => Number(v.precioVenta)))
      : Number(p.precioVentaSugerido)
  }));

  return {
    datos: productosFormateados,
    paginacion: {
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
      totalRegistros: total,
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene todos los productos con filtros y paginación
 */
async function obtenerProductosPublicos(opciones = {}) {
  const { pagina = 1, limite = 12, orden = 'recientes', idCategoria } = opciones;
  const skip = (Number(pagina) - 1) * Number(limite);

  let orderBy = { creadoEn: 'desc' };
  if (orden === 'precio_asc') orderBy = { precioVentaSugerido: 'asc' };
  if (orden === 'precio_desc') orderBy = { precioVentaSugerido: 'desc' };
  if (orden === 'nombre') orderBy = { nombreProducto: 'asc' };

  const where = { estado: 'activo' };
  
  if (idCategoria) {
    const categoriasIds = [Number(idCategoria)];
    const subcategorias = await prisma.categoria.findMany({
      where: { categoriaPadre: Number(idCategoria), estado: 'activo' },
      select: { idCategoria: true }
    });
    subcategorias.forEach(sub => categoriasIds.push(sub.idCategoria));
    where.idCategoria = { in: categoriasIds };
  }

  const [productos, total] = await prisma.$transaction([
    prisma.producto.findMany({
      where,
      select: {
        idProducto: true,
        nombreProducto: true,
        codigoReferencia: true,
        precioVentaSugerido: true,
        imagenes: {
          where: { esPrincipal: true },
          take: 1,
          select: { rutaImagen: true }
        },
        tieneColores: true,
        tieneTallas: true,
        creadoEn: true,
        variantes: {
          where: { estado: 'activo' },
          select: {
            precioVenta: true,
            cantidadStock: true,
            color: { select: { idColor: true, nombreColor: true, codigoHex: true } },
            talla: { select: { idTalla: true, nombreTalla: true } }
          }
        }
      },
      orderBy,
      skip,
      take: Number(limite)
    }),
    prisma.producto.count({ where })
  ]);

  const productosFormateados = productos.map(p => {
    const coloresUnicos = [];
    
    p.variantes.forEach(v => {
      if (v.color && !coloresUnicos.find(c => c.idColor === v.color.idColor)) {
        coloresUnicos.push(v.color);
      }
    });

    return {
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      codigoReferencia: p.codigoReferencia,
      precioVentaSugerido: Number(p.precioVentaSugerido),
      imagenPrincipal: p.imagenes[0]?.rutaImagen || null,
      tieneColores: p.tieneColores,
      tieneTallas: p.tieneTallas,
      creadoEn: p.creadoEn,
      stockTotal: p.variantes.reduce((sum, v) => sum + Number(v.cantidadStock), 0),
      precioMinimo: p.variantes.length > 0
        ? Math.min(...p.variantes.map(v => Number(v.precioVenta)))
        : Number(p.precioVentaSugerido),
      coloresDisponibles: coloresUnicos
    };
  });

  return {
    datos: productosFormateados,
    paginacion: {
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
      totalRegistros: total,
      registrosPorPagina: Number(limite)
    }
  };
}

module.exports = {
  obtenerCategoriasActivas,
  obtenerCategoriaPorSlug,
  obtenerProductosDestacados,
  obtenerProductosPorCategoria,
  obtenerProductoDetalle,
  obtenerVariantesProducto,
  buscarProductos,
  obtenerProductosPublicos
};
