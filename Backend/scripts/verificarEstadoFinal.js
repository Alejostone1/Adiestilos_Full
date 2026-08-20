const { prisma } = require('../src/config/databaseConfig');

async function verificarEstadoFinal() {
  try {
    console.log('📊 Verificando estado final de imágenes...');

    // Verificar productos con imagenPrincipal
    const productos = await prisma.producto.findMany({
      select: {
        idProducto: true,
        nombreProducto: true,
        imagenPrincipal: true
      }
    });

    console.log('\n🖼️ Productos y sus imágenes principales:');
    productos.forEach(producto => {
      console.log(`  - Producto ${producto.idProducto} (${producto.nombreProducto}): ${producto.imagenPrincipal || 'SIN IMAGEN'}`);
    });

    // Verificar imágenes en tabla imagenes_productos
    const imagenes = await prisma.imagenProducto.findMany({
      select: {
        idImagen: true,
        idProducto: true,
        rutaImagen: true,
        esPrincipal: true,
        orden: true
      },
      orderBy: {
        idProducto: 'asc'
      }
    });

    console.log('\n📸 Imágenes en tabla imagenes_productos:');
    imagenes.forEach(imagen => {
      console.log(`  - Imagen ${imagen.idImagen}: Producto ${imagen.idProducto} | Principal: ${imagen.esPrincipal} | Orden: ${imagen.orden} | Ruta: ${imagen.rutaImagen}`);
    });

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error al verificar estado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstadoFinal();
