/**
 * Servicio para la lógica de negocio de Reportes de Inventario.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Genera diferentes tipos de reportes de inventario.
 * @param {object} opciones - Opciones para el reporte ({ tipoReporte }).
 * @returns {Promise<object>} Un objeto con los datos del reporte.
 */
async function generarReporteInventario(opciones) {
  const { tipoReporte } = opciones;

  switch (tipoReporte) {
    case 'stock_bajo':
      return generarReporteStockBajo();

    case 'movimientos_recientes':
      return generarReporteMovimientosRecientes();

    case 'valoracion':
    default:
      return generarReporteValoracion();
  }
}

/**
 * Genera un reporte de valoración total del inventario.
 */
async function generarReporteValoracion() {
  const variantes = await prisma.varianteProducto.findMany({
    where: { estado: 'activo' },
    select: {
      cantidadStock: true,
      precioCosto: true,
      precioVenta: true
    }
  });

  let valorTotalCosto = 0;
  let valorTotalVenta = 0;
  let unidadesTotales = 0;

  for (const variante of variantes) {
    valorTotalCosto += variante.cantidadStock * variante.precioCosto;
    valorTotalVenta += variante.cantidadStock * variante.precioVenta;
    unidadesTotales += variante.cantidadStock;
  }

  const numeroSkus = variantes.length;

  return {
    tipo: 'Valoración de Inventario',
    resumen: {
      valorTotalCosto,
      valorTotalVenta,
      gananciaPotencial: valorTotalVenta - valorTotalCosto,
      unidadesTotales,
      numeroSkus
    }
  };
}

/**
 * Genera un reporte de productos con stock bajo o sin stock.
 */
async function generarReporteStockBajo() {
  const stockBajo = await prisma.varianteProducto.findMany({
    where: {
      estado: 'activo',
      cantidadStock: { lte: prisma.varianteProducto.fields.stockMinimo },
      stockMinimo: { gt: 0 }
    },
    include: {
        producto: { select: { nombreProducto: true } }
    },
    orderBy: { cantidadStock: 'asc' }
  });

  return {
    tipo: 'Reporte de Stock Bajo',
    fecha: new Date(),
    items: stockBajo,
    totalItems: stockBajo.length
  };
}

/**
 * Genera un reporte con los últimos movimientos de inventario.
 */
async function generarReporteMovimientosRecientes() {
    const movimientos = await prisma.movimientoInventario.findMany({
        take: 50, // Limitar a los últimos 50 movimientos
        orderBy: { fechaMovimiento: 'desc' },
        include: {
            variante: { include: { producto: {select: {nombreProducto: true}}}},
            tipoMovimiento: true,
            usuarioRegistroRef: { select: { usuario: true }}
        }
    });

    return {
        tipo: 'Últimos 50 Movimientos de Inventario',
        fecha: new Date(),
        movimientos
    };
}


// --- EXPORTACIÓN ---
module.exports = {
  generarReporteInventario
};
