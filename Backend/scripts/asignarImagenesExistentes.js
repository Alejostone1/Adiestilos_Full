const { prisma } = require('../src/config/databaseConfig');

async function asignarImagenesExistentes() {
  try {
    console.log('🔄 Asignando imágenes existentes como principales...');

    // Obtener todos los productos
    const productos = await prisma.producto.findMany({
      select: {
        idProducto: true,
        nombreProducto: true,
        imagenPrincipal: true
      }
    });

    // Obtener todas las imágenes existentes
    const imagenesExistentes = await prisma.imagenProducto.findMany({
      select: {
        idImagen: true,
        idProducto: true,
        rutaImagen: true,
        esPrincipal: true
      }
    });

    console.log(`📊 Productos: ${productos.length}`);
    console.log(`📊 Imágenes existentes: ${imagenesExistentes.length}`);

    // Para cada producto sin imagenPrincipal, asignar la primera imagen disponible
    for (const producto of productos) {
      if (!producto.imagenPrincipal) {
        // Buscar imágenes de este producto
        const imagenesDelProducto = imagenesExistentes.filter(
          img => img.idProducto === producto.idProducto
        );

        if (imagenesDelProducto.length > 0) {
          const primeraImagen = imagenesDelProducto[0];
          
          // Asignar como imagenPrincipal del producto
          await prisma.producto.update({
            where: { idProducto: producto.idProducto },
            data: { imagenPrincipal: primeraImagen.rutaImagen }
          });

          // Marcar como principal en la tabla de imágenes
          await prisma.imagenProducto.update({
            where: { idImagen: primeraImagen.idImagen },
            data: { esPrincipal: true }
          });

          console.log(`✅ Producto ${producto.idProducto} (${producto.nombreProducto}) - Imagen principal asignada: ${primeraImagen.rutaImagen}`);
        } else {
          console.log(`⚠️ Producto ${producto.idProducto} (${producto.nombreProducto}) - No tiene imágenes`);
        }
      }
    }

    console.log('✅ Asignación completada');
  } catch (error) {
    console.error('❌ Error al asignar imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarImagenesExistentes();
