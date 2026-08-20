const { prisma } = require('../src/config/databaseConfig');

async function testCategoriasImagenes() {
  try {
    console.log('🔍 Verificando categorías con imágenes...');

    // Obtener todas las categorías
    const categorias = await prisma.categoria.findMany({
      select: {
        idCategoria: true,
        nombreCategoria: true,
        descripcion: true,
        imagenCategoria: true,
        estado: true
      }
    });

    console.log(`📊 Total categorías: ${categorias.length}`);
    
    // Mostrar categorías con imágenes
    const categoriasConImagen = categorias.filter(c => c.imagenCategoria);
    const categoriasSinImagen = categorias.filter(c => !c.imagenCategoria);

    console.log(`🖼️ Categorías con imagen: ${categoriasConImagen.length}`);
    console.log(`📝 Categorías sin imagen: ${categoriasSinImagen.length}`);

    if (categoriasConImagen.length > 0) {
      console.log('\n📋 Categorías con imágenes:');
      categoriasConImagen.forEach(categoria => {
        console.log(`  - ${categoria.nombreCategoria} (ID: ${categoria.idCategoria})`);
        console.log(`    Imagen: ${categoria.imagenCategoria}`);
      });
    }

    if (categoriasSinImagen.length > 0) {
      console.log('\n📋 Categorías sin imágenes:');
      categoriasSinImagen.forEach(categoria => {
        console.log(`  - ${categoria.nombreCategoria} (ID: ${categoria.idCategoria})`);
      });
    }

    // Probar creación de categoría con imagen
    console.log('\n🧪 Probando creación de categoría con imagen...');
    const testCategoria = {
      nombreCategoria: 'Categoría Test',
      descripcion: 'Categoría de prueba para testing',
      imagenCategoria: '/uploads/categorias/test_imagen.jpg',
      estado: 'activo'
    };

    console.log('Datos de prueba:', testCategoria);
    console.log('✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoriasImagenes();
