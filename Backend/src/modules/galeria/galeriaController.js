const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const galeriaController = {
  // Obtener resumen general para el dashboard
  obtenerResumen: async (req, res) => {
    try {
      const [
        totalProductos,
        totalVariantes,
        totalProveedores,
        totalCategorias,
        totalImagenesProductos,
        totalImagenesVariantes
      ] = await Promise.all([
        prisma.producto.count(),
        prisma.varianteProducto.count(),
        prisma.proveedor.count(),
        prisma.categoria.count(),
        prisma.imagenProducto.count(),
        prisma.imagenVariante.count()
      ]);

      res.status(200).json({
        datos: {
          productos: totalProductos,
          variantes: totalVariantes,
          proveedores: totalProveedores,
          categorias: totalCategorias,
          totalImagenes: totalImagenesProductos + totalImagenesVariantes
        }
      });
    } catch (error) {
      console.error('Error al obtener resumen de galería:', error);
      res.status(500).json({ mensaje: 'Error al obtener resumen de galería' });
    }
  },

  // Obtener productos con toda su data relacional para el wizard/galería
  listarProductosGaleria: async (req, res) => {
    try {
      const { pagina = 1, limite = 24, busqueda = '' } = req.query;
      const skip = (parseInt(pagina) - 1) * parseInt(limite);
      
      const where = busqueda ? {
        OR: [
          { nombreProducto: { contains: busqueda } },
          { codigoReferencia: { contains: busqueda } }
        ]
      } : {};

      const [productos, total] = await Promise.all([
        prisma.producto.findMany({
          where,
          include: {
            categoria: { select: { nombreCategoria: true } },
            imagenes: {
              orderBy: { esPrincipal: 'desc' }
            },
            variantes: {
              where: { estado: 'activo' },
              include: {
                color: true,
                talla: true,
                imagenesVariantes: {
                  orderBy: { esPrincipal: 'desc' }
                }
              }
            }
          },
          skip,
          take: parseInt(limite),
          orderBy: { actualizadoEn: 'desc' }
        }),
        prisma.producto.count({ where })
      ]);

      // Formatear respuesta para la UI Premium
      const productosFormateados = productos.map(p => ({
        id: p.idProducto,
        titulo: p.nombreProducto,
        subtitulo: p.codigoReferencia,
        nombreCategoria: p.categoria?.nombreCategoria || 'Sin categoría',
        idCategoria: p.idCategoria,
        imagen: p.imagenes[0]?.rutaImagen || null,
        totalVariantes: p.variantes.length,
        variantes: p.variantes.map(v => ({
          id: v.idVariante,
          idProducto: v.idProducto,
          codigoSku: v.codigoSku,
          precioVenta: Number(v.precioVenta),
          cantidadStock: Number(v.cantidadStock),
          color: v.color,
          talla: v.talla,
          imagen: v.imagenesVariantes[0]?.rutaImagen || p.imagenes[0]?.rutaImagen || null
        })),
        updatedAt: p.actualizadoEn
      }));

      res.status(200).json({
        datos: productosFormateados,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          totalPaginas: Math.ceil(total / parseInt(limite)),
          registrosPorPagina: parseInt(limite)
        }
      });
    } catch (error) {
      console.error('Error al listar productos en galería:', error);
      res.status(500).json({ mensaje: 'Error al listar productos' });
    }
  },

  // Obtener variantes con conteo de imágenes
  listarVariantesGaleria: async (req, res) => {
    try {
      const { pagina = 1, limite = 12, busqueda = '' } = req.query;
      const skip = (parseInt(pagina) - 1) * parseInt(limite);

      const where = busqueda ? {
          OR: [
              { codigoSku: { contains: busqueda } },
              { producto: { nombreProducto: { contains: busqueda } } }
          ]
      } : {};

      const [variantes, total] = await Promise.all([
        prisma.varianteProducto.findMany({
          where,
          include: {
            producto: {
              select: { nombreProducto: true }
            },
            color: true,
            talla: true,
            imagenesVariantes: {
              take: 1,
              orderBy: { esPrincipal: 'desc' }
            },
            _count: {
              select: { imagenesVariantes: true }
            }
          },
          skip,
          take: parseInt(limite),
          orderBy: { actualizadoEn: 'desc' }
        }),
        prisma.varianteProducto.count({ where })
      ]);

       const variantesFormateadas = variantes.map(v => ({
        id: v.idVariante,
        titulo: `${v.producto.nombreProducto}`,
        subtitulo: v.codigoSku,
        atributos: `${v.color?.nombreColor || ''} / ${v.talla?.nombreTalla || ''}`,
        imagenPrincipal: v.imagenesVariantes[0]?.rutaImagen || null,
        totalImagenes: v._count.imagenesVariantes,
        updatedAt: v.actualizadoEn
      }));

      res.status(200).json({
        datos: variantesFormateadas,
        paginacion: {
           total,
           pagina: parseInt(pagina),
           totalPaginas: Math.ceil(total / parseInt(limite))
        }
      });
    } catch (error) {
      console.error('Error al listar variantes en galería:', error);
      res.status(500).json({ mensaje: 'Error al listar variantes' });
    }
  },

  // Listar proveedores (con su imagen única)
  listarProveedoresGaleria: async (req, res) => {
      try {
           const proveedores = await prisma.proveedor.findMany({
               select: {
                   idProveedor: true,
                   nombreProveedor: true,
                   imagenProveedor: true,
                   actualizadoEn: true
               },
               orderBy: { nombreProveedor: 'asc' }
           });
           
           // Mapeo simple
           const datos = proveedores.map(p => ({
               id: p.idProveedor,
               titulo: p.nombreProveedor,
               imagen: p.imagenProveedor,
               tipo: 'proveedor'
           }));

           res.status(200).json({ datos });
      } catch (error) {
           console.error('Error al listar proveedores:', error);
           res.status(500).json({ mensaje: 'Error interno' });
      }
  },

  // Listar categorias (con su imagen única)
  listarCategoriasGaleria: async (req, res) => {
       try {
           const categorias = await prisma.categoria.findMany({
               select: {
                   idCategoria: true,
                   nombreCategoria: true,
                   imagenCategoria: true,
               },
               orderBy: { nombreCategoria: 'asc' }
           });
           
           const datos = categorias.map(c => ({
               id: c.idCategoria,
               titulo: c.nombreCategoria,
               imagen: c.imagenCategoria,
               tipo: 'categoria'
           }));

           res.status(200).json({ datos });
      } catch (error) {
           console.error('Error al listar categorias:', error);
           res.status(500).json({ mensaje: 'Error interno' });
      }
  }
};

module.exports = galeriaController;
