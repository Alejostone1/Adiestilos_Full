require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const seedRoles = require('./seeds/01_roles.seed');
const seedEstadosPedido = require('./seeds/02_estados_pedido.seed');
const seedTiposMovimiento = require('./seeds/03_tipos_movimiento.seed');
const seedColores = require('./seeds/04_colores.seed');
const seedTallas = require('./seeds/05_tallas.seed');
const seedCategorias = require('./seeds/06_categorias.seed');
const seedProveedores = require('./seeds/07_proveedores.seed');
const seedTiposMetodoPago = require('./seeds/08_tipos_metodo_pago.seed');
const seedMetodosPago = require('./seeds/09_metodos_pago.seed');
const seedUsuarios = require('./seeds/10_usuarios.seed');
const seedProductos = require('./seeds/20_productos.seed');
const seedCompras = require('./seeds/30_compras.seed');

const prisma = new PrismaClient();

async function ejecutarSeed(nombreArchivo, fn, modelo) {
  console.log(`\n[SEED] ▶ ${nombreArchivo}`);
  try {
    return await fn(prisma);
  } catch (error) {
    console.error('\n[SEED] ERROR');
    console.error(`[SEED] Archivo: ${nombreArchivo}`);
    console.error(`[SEED] Modelo: ${modelo || 'desconocido'}`);
    console.error(`[SEED] Registro: ${error?.meta?.target || error?.meta?.field || 'desconocido'}`);
    console.error('[SEED] Error Prisma:', error);
    throw error;
  }
}

async function main() {
  const resumen = {};

  try {
    console.log('🌱 Iniciando seeds...');

    // ===== FASE A: CATÁLOGOS BASE =====
    resumen.roles = await ejecutarSeed('01_roles.seed.js', seedRoles, 'Rol');
    resumen.estadosPedido = await ejecutarSeed('02_estados_pedido.seed.js', seedEstadosPedido, 'EstadoPedido');
    resumen.tiposMovimiento = await ejecutarSeed('03_tipos_movimiento.seed.js', seedTiposMovimiento, 'TipoMovimiento');
    resumen.colores = await ejecutarSeed('04_colores.seed.js', seedColores, 'Color');
    resumen.tallas = await ejecutarSeed('05_tallas.seed.js', seedTallas, 'Talla');
    resumen.categorias = await ejecutarSeed('06_categorias.seed.js', seedCategorias, 'Categoria');
    resumen.proveedores = await ejecutarSeed('07_proveedores.seed.js', seedProveedores, 'Proveedor');
    resumen.tiposMetodoPago = await ejecutarSeed('08_tipos_metodo_pago.seed.js', seedTiposMetodoPago, 'TipoMetodoPago');
    resumen.metodosPago = await ejecutarSeed('09_metodos_pago.seed.js', seedMetodosPago, 'MetodoPago');

    // ===== FASE B: USUARIOS DEMO =====
    resumen.usuarios = await ejecutarSeed('10_usuarios.seed.js', seedUsuarios, 'Usuario');

    // ===== FASE C: PRODUCTOS DEMO =====
    const resultadoProductos = await ejecutarSeed('20_productos.seed.js', seedProductos, 'Producto/Variante/Imagen');
    resumen.productos = resultadoProductos?.productos || 0;
    resumen.variantes = resultadoProductos?.variantes || 0;
    resumen.imagenesProducto = resultadoProductos?.imagenesProducto || 0;
    resumen.imagenesVariantes = resultadoProductos?.imagenesVariantes || 0;

    // ===== FASE D: COMPRAS + STOCK INICIAL (trazable) =====
    const resultadoCompras = await ejecutarSeed('30_compras.seed.js', seedCompras, 'Compra/Detalle/Movimiento');
    resumen.compras = resultadoCompras?.compras || 0;
    resumen.lineasCompra = resultadoCompras?.lineas || 0;
  } catch (error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log(`
=================================
SEED COMPLETADO
=================================
Roles: ${resumen.roles}
Usuarios: ${resumen.usuarios}
Categorías: ${resumen.categorias}
Productos: ${resumen.productos}
Variantes: ${resumen.variantes}
Imágenes: ${resumen.imagenesProducto + resumen.imagenesVariantes}
Colores: ${resumen.colores}
Tallas: ${resumen.tallas}
Proveedores: ${resumen.proveedores}
Estados de pedido: ${resumen.estadosPedido}
Compras de inventario: ${resumen.compras}
Líneas de compra: ${resumen.lineasCompra}
=================================`);
}

main();