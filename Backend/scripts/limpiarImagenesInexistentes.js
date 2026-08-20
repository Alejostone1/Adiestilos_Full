const { prisma } = require('../src/config/databaseConfig');
const fs = require('fs').promises;
const path = require('path');

async function limpiarImagenesInexistentes() {
  try {
    console.log('🔄 Limpiando imágenes inexistentes...');

    // Obtener todas las imágenes de productos de la BD
    const imagenesProductos = await prisma.imagenProducto.findMany({
      select: {
        idImagen: true,
        idProducto: true,
        rutaImagen: true
      }
    });

    // Obtener todas las imágenes de variantes de la BD
    const imagenesVariantes = await prisma.imagenVariante.findMany({
      select: {
        idImagenVariante: true,
        idVariante: true,
        rutaImagen: true
      }
    });

    // Obtener todos los productos con imagenPrincipal
    const productosConImagen = await prisma.producto.findMany({
      where: {
        imagenPrincipal: {
          not: null
        }
      },
      select: {
        idProducto: true,
        imagenPrincipal: true
      }
    });

    const uploadsDir = path.join(__dirname, '../uploads');
    let eliminadas = 0;

    // Verificar imágenes de productos
    for (const img of imagenesProductos) {
      const fullPath = path.join(uploadsDir, img.rutaImagen.replace('/uploads/', ''));
      try {
        await fs.access(fullPath);
      } catch (error) {
        console.log(`❌ Imagen de producto no existe: ${img.rutaImagen}`);
        await prisma.imagenProducto.delete({
          where: { idImagen: img.idImagen }
        });
        eliminadas++;
        console.log(`🗑️ Eliminada referencia de imagen de producto ${img.idImagen}`);
      }
    }

    // Verificar imágenes de variantes
    for (const img of imagenesVariantes) {
      const fullPath = path.join(uploadsDir, img.rutaImagen.replace('/uploads/', ''));
      try {
        await fs.access(fullPath);
      } catch (error) {
        console.log(`❌ Imagen de variante no existe: ${img.rutaImagen}`);
        await prisma.imagenVariante.delete({
          where: { idImagenVariante: img.idImagenVariante }
        });
        eliminadas++;
        console.log(`🗑️ Eliminada referencia de imagen de variante ${img.idImagenVariante}`);
      }
    }

    // Verificar imagenPrincipal de productos
    for (const producto of productosConImagen) {
      const fullPath = path.join(uploadsDir, producto.imagenPrincipal.replace('/uploads/', ''));
      try {
        await fs.access(fullPath);
      } catch (error) {
        console.log(`❌ Imagen principal de producto no existe: ${producto.imagenPrincipal}`);
        await prisma.producto.update({
          where: { idProducto: producto.idProducto },
          data: { imagenPrincipal: null }
        });
        eliminadas++;
        console.log(`🗑️ Eliminada imagen principal del producto ${producto.idProducto}`);
      }
    }

    console.log(`✅ Limpieza completada. Se eliminaron ${eliminadas} referencias a imágenes inexistentes.`);
  } catch (error) {
    console.error('❌ Error al limpiar imágenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarImagenesInexistentes();
