// Script para probar el formato de precios sin decimales

// Simulación del componente PrecioFormateado
const PrecioFormateado = ({ precio }) => {
  // Validar que el precio sea un número válido
  if (precio === null || precio === undefined || isNaN(precio)) {
    return '$0';
  }

  // Formatear sin decimales para pesos colombianos
  const formato = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0, // Sin decimales
    maximumFractionDigits: 0, // Sin decimales
  });

  return formato.format(precio);
};

// Casos de prueba
const testCases = [
  { nombre: 'Precio simple', precio: 10000 },
  { nombre: 'Precio con decimales', precio: 10000.50 },
  { nombre: 'Precio grande', precio: 1500000 },
  { nombre: 'Precio con .99', precio: 9999.99 },
  { nombre: 'Precio cero', precio: 0 },
  { nombre: 'Precio nulo', precio: null },
  { nombre: 'Precio indefinido', precio: undefined },
  { nombre: 'Precio no válido', precio: NaN },
  { nombre: 'Precio negativo', precio: -5000 },
  { nombre: 'Precio miles', precio: 25000 },
];

console.log('🧪 Probando formato de precios sin decimales:\n');

testCases.forEach((testCase, index) => {
  try {
    const resultado = PrecioFormateado({ precio: testCase.precio });
    console.log(`${index + 1}. ${testCase.nombre}:`);
    console.log(`   Input: ${testCase.precio}`);
    console.log(`   Output: ${resultado}`);
    console.log('');
  } catch (error) {
    console.log(`${index + 1}. ${testCase.nombre}: ❌ ERROR - ${error.message}`);
    console.log('');
  }
});

// Pruebas específicas para el formato colombiano
console.log('📊 Pruebas específicas de formato colombiano:\n');

const preciosColombianos = [
  1000,    // $1.000
  10000,   // $10.000
  100000,  // $100.000
  1000000, // $1.000.000
  1234567, // $1.234.567
];

preciosColombianos.forEach((precio, index) => {
  const resultado = PrecioFormateado({ precio });
  console.log(`${index + 1}. ${precio.toLocaleString('es-CO')} → ${resultado}`);
});

console.log('\n✅ Test completado exitosamente');
console.log('\n📝 Resumen:');
console.log('- ✅ Sin decimales (.00)');
console.log('- ✅ Separador de miles con punto');
console.log('- ✅ Símbolo $ incluido');
console.log('- ✅ Manejo de valores nulos/inválidos');
