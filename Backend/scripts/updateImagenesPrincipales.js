const { prisma } = require('../src/config/databaseConfig');

async function updateImagenesPrincipales() {
  try {
    console.log('🔄 Actualizando imágenes principales...');

    // Actualizar imágenes de productos
    const productosConImagenes = await prisma.imagenProducto.groupBy({
      by: ['idProducto'],
      _count: {
        idImagen: true
      },
      where: {
        esPrincipal: false
      }
    });

    for (const producto of productosConImagenes) {
      // Verificar si ya tiene una imagen principal
      const imagenPrincipalExistente = await prisma.imagenProducto.findFirst({
        where: {
          idProducto: producto.idProducto,
          esPrincipal: true
        }
      });

      if (!imagenPrincipalExistente) {
        // Obtener la primera imagen y marcarla como principal
        const primeraImagen = await prisma.imagenProducto.findFirst({
          where: {
            idProducto: producto.idProducto
          },
          orderBy: {
            creadoEn: 'asc'
          }
        });

        if (primeraImagen) {
          await prisma.imagenProducto.update({
            where: {
              idImagen: primeraImagen.idImagen
            },
            data: {
              esPrincipal: true
            }
          });
          console.log(`✅ Imagen principal actualizada para producto ${producto.idProducto}`);
        }
      }
    }

    // Actualizar imágenes de variantes
    const variantesConImagenes = await prisma.imagenVariante.groupBy({
      by: ['idVariante'],
      _count: {
        idImagenVariante: true
      },
      where: {
        esPrincipal: false
      }
    });

    for (const variante of variantesConImagenes) {
      // Verificar si ya tiene una imagen principal
      const imagenPrincipalExistente = await prisma.imagenVariante.findFirst({
        where: {
          idVariante: variante.idVariante,
          esPrincipal: true
        }
      });

      if (!imagenPrincipalExistente) {
        // Obtener la primera imagen y marcarla como principal
        const primeraImagen = await prisma.imagenVariante.findFirst({
          where: {
            idVariante: variante.idVariante
          },
          orderBy: {
            creadoEn: 'asc'
          }
        });

        if (primeraImagen) {
          await prisma.imagenVariante.update({
            where: {
              idImagenVariante: primeraImagen.idImagenVariante
            },
            data: {
              esPrincipal: true
            }
          });
          console.log(`✅ Imagen principal actualizada para variante ${variante.idVariante}`);
        }
      }
    }

    // Actualizar orden de imágenes
    console.log('🔄 Actualizando orden de imágenes...');
    
    // Actualizar orden de imágenes de productos
    const productosIds = await prisma.imagenProducto.groupBy({
      by: ['idProducto']
    });

    for (const producto of productosIds) {
      const imagenes = await prisma.imagenProducto.findMany({
        where: {
          idProducto: producto.idProducto
        },
        orderBy: {
          creadoEn: 'asc'
        }
      });

      for (let i = 0; i < imagenes.length; i++) {
        await prisma.imagenProducto.update({
          where: {
            idImagen: imagenes[i].idImagen
          },
          data: {
            orden: i
          }
        });
      }
    }

    // Actualizar orden de imágenes de variantes
    const variantesIds = await prisma.imagenVariante.groupBy({
      by: ['idVariante']
    });

    for (const variante of variantesIds) {
      const imagenes = await prisma.imagenVariante.findMany({
        where: {
          idVariante: variante.idVariante
        },
        orderBy: {
          creadoEn: 'asc'
        }
      });

      for (let i = 0; i < imagenes.length; i++) {
        await prisma.imagenVariante.update({
          where: {
            idImagenVariante: imagenes[i].idImagenVariante
          },
          data: {
            orden: i
          }
        });
      }
    }

    console.log('✅ Actualización completada exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updateImagenesPrincipales();
