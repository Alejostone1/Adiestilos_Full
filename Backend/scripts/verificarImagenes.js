const { prisma } = require('../src/config/databaseConfig');

async function verificarImagenes() {
  try {
    console.log('📊 Verificando imágenes principales...');
    
    // Verificar imágenes de productos
    const imagenesProductos = await prisma.imagenProducto.findMany({
      select: {
        idImagen: true,
        idProducto: true,
        rutaImagen: true,
        esPrincipal: true,
        orden: true,
        descripcion: true
      },
      orderBy: {
        idProducto: 'asc'
      }
    });
    
    console.log('\n🖼️ Imágenes de Productos:');
    imagenesProductos.forEach(img => {
      console.log(`  - Producto ${img.idProducto}: Imagen ${img.idImagen} | Principal: ${img.esPrincipal} | Orden: ${img.orden}`);
    });
    
    // Verificar imágenes de variantes
    const imagenesVariantes = await prisma.imagenVariante.findMany({
      select: {
        idImagenVariante: true,
        idVariante: true,
        rutaImagen: true,
        esPrincipal: true,
        orden: true,
        descripcion: true
      },
      orderBy: {
        idVariante: 'asc'
      }
    });
    
    console.log('\n🌈 Imágenes de Variantes:');
    imagenesVariantes.forEach(img => {
      console.log(`  - Variante ${img.idVariante}: Imagen ${img.idImagenVariante} | Principal: ${img.esPrincipal} | Orden: ${img.orden}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarImagenes();
