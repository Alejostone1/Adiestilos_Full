const { prisma } = require('../src/config/databaseConfig');

async function crearImagenesFisicas() {
  try {
    console.log('🔄 Creando registros para imágenes físicas...');

    // Las imágenes que existen físicamente
    const imagenesFisicas = [
      'prod_1768175413617.jpeg',
      'prod_1768175759767.jpg'
    ];

    // Obtener todos los productos
    const productos = await prisma.producto.findMany({
      select: {
        idProducto: true,
        nombreProducto: true
      }
    });

    console.log(`📊 Productos disponibles: ${productos.length}`);
    console.log(`📊 Imágenes físicas: ${imagenesFisicas.length}`);

    // Asignar la primera imagen al primer producto, la segunda al segundo producto
    for (let i = 0; i < Math.min(imagenesFisicas.length, productos.length); i++) {
      const imagen = imagenesFisicas[i];
      const producto = productos[i];
      
      const rutaImagen = `/uploads/productos/${imagen}`;
      
      // Crear registro en imagenes_productos
      const imagenCreada = await prisma.imagenProducto.create({
        data: {
          idProducto: producto.idProducto,
          rutaImagen: rutaImagen,
          esPrincipal: true,
          orden: 0,
          descripcion: `Imagen principal de ${producto.nombreProducto}`
        }
      });

      // Actualizar imagenPrincipal del producto
      await prisma.producto.update({
        where: { idProducto: producto.idProducto },
        data: { imagenPrincipal: rutaImagen }
      });

      console.log(`✅ Producto ${producto.idProducto} (${producto.nombreProducto}) - Imagen creada: ${rutaImagen}`);
    }

    console.log('✅ Creación de registros completada');
  } catch (error) {
    console.error('❌ Error al crear registros:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearImagenesFisicas();
