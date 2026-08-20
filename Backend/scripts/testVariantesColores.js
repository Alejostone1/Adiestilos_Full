const { prisma } = require('../src/config/databaseConfig');

async function testVariantesColores() {
  try {
    console.log('🔍 Verificando variantes con colores...');

    // Obtener todas las variantes con sus colores
    const variantes = await prisma.varianteProducto.findMany({
      where: {},
      include: {
        producto: {
          select: {
            idProducto: true,
            nombreProducto: true,
          },
        },
        color: {
          select: {
            idColor: true,
            nombreColor: true,
            codigoHex: true,
          },
        },
        talla: {
          select: {
            idTalla: true,
            nombreTalla: true,
          },
        },
      },
      take: 10, // Limitar a 10 para prueba
      orderBy: {
        idVariante: 'desc',
      },
    });

    console.log(`📊 Total variantes encontradas: ${variantes.length}`);

    if (variantes.length > 0) {
      console.log('\n📋 Detalle de variantes con colores:');
      
      variantes.forEach((variante, index) => {
        console.log(`\n${index + 1}. Variante ID: ${variante.idVariante}`);
        console.log(`   Producto: ${variante.producto?.nombreProducto || 'N/A'}`);
        
        if (variante.color) {
          console.log(`   Color: ${variante.color.nombreColor}`);
          console.log(`   Código Hex: ${variante.color.codigoHex || '❌ SIN CÓDIGO HEX'}`);
          console.log(`   ID Color: ${variante.color.idColor}`);
        } else {
          console.log(`   Color: ❌ SIN COLOR ASIGNADO`);
        }
        
        console.log(`   Talla: ${variante.talla?.nombreTalla || 'N/A'}`);
        console.log(`   SKU: ${variante.codigoSku || 'N/A'}`);
      });

      // Verificar cuántas tienen código hex
      const conCodigoHex = variantes.filter(v => v.color && v.color.codigoHex).length;
      const sinCodigoHex = variantes.filter(v => !v.color || !v.color.codigoHex).length;
      
      console.log(`\n📈 Estadísticas:`);
      console.log(`   ✅ Con código Hex: ${conCodigoHex}`);
      console.log(`   ❌ Sin código Hex: ${sinCodigoHex}`);
      console.log(`   📊 Porcentaje con código: ${((conCodigoHex / variantes.length) * 100).toFixed(1)}%`);

    } else {
      console.log('❌ No se encontraron variantes');
    }

    // Verificar colores disponibles
    console.log('\n🎨 Colores disponibles en la base de datos:');
    const colores = await prisma.color.findMany({
      select: {
        idColor: true,
        nombreColor: true,
        codigoHex: true,
        estado: true
      },
      orderBy: {
        nombreColor: 'asc'
      }
    });

    console.log(`Total colores: ${colores.length}`);
    
    colores.forEach(color => {
      console.log(`  - ${color.nombreColor}: ${color.codigoHex || '❌ SIN HEX'} (${color.estado})`);
    });

    console.log('\n✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantesColores();
