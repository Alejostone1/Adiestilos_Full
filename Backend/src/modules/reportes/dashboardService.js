/**
 * Servicio para la lógica de negocio del Dashboard.
 * Provee datos clave y resúmenes para el panel de control principal.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Calcula la fecha de inicio según el rango especificado.
 * @param {string} rango - 'dia', 'semana', 'mes'.
 * @returns {Date} La fecha de inicio del rango.
 */
function calcularFechaInicio(rango) {
  const ahora = new Date();
  if (rango === 'mes') {
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  }
  if (rango === 'semana') {
    const primerDiaSemana = ahora.getDate() - ahora.getDay();
    return new Date(ahora.setDate(primerDiaSemana));
  }
  // Por defecto, 'dia'
  return new Date(ahora.setHours(0, 0, 0, 0));
}

/**
 * Obtiene un resumen de datos clave para el dashboard.
 * @param {string} rango - El rango de tiempo para el resumen ('dia', 'semana', 'mes').
 * @returns {Promise<object>} Un objeto con las métricas del dashboard.
 */
async function obtenerResumen(rango) {
  const fechaInicio = calcularFechaInicio(rango);

  // 1. Total de ventas y número de ventas en el rango
  const ventasAgregadas = await prisma.venta.aggregate({
    _sum: { total: true },
    _count: { idVenta: true },
    where: { creadoEn: { gte: fechaInicio } }
  });

  // 2. Total de créditos activos y saldo pendiente total
  const creditosAgregados = await prisma.credito.aggregate({
    _sum: { saldoPendiente: true },
    _count: { idCredito: true },
    where: { estado: 'activo' }
  });

  // 3. Número de clientes nuevos en el rango
  const nuevosClientes = await prisma.usuario.count({
    where: {
      rol: { nombreRol: 'Cliente' },
      creadoEn: { gte: fechaInicio }
    }
  });

  // 4. Productos más vendidos en el rango
  const productosMasVendidos = await prisma.detalleVenta.groupBy({
    by: ['idVariante'],
    _sum: { cantidad: true },
    where: { venta: { creadoEn: { gte: fechaInicio } } },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 5
  });

  // Obtener detalles de las variantes más vendidas
  const idsVariantes = productosMasVendidos.map(p => p.idVariante);
  const detallesVariantes = await prisma.varianteProducto.findMany({
    where: { idVariante: { in: idsVariantes } },
    include: {
        producto: { select: { nombreProducto: true } },
        color: true,
        talla: true
    }
  });

  const topProductos = productosMasVendidos.map(p => {
    const detalle = detallesVariantes.find(v => v.idVariante === p.idVariante);
    return {
      ...p,
      variante: detalle
    };
  });
  
  // 5. Ventas por día para el gráfico (últimos 7 días)
  const ventasPorDia = await prisma.$queryRaw`
    SELECT
        DATE(creado_en) as fecha,
        SUM(total) as totalVentas
    FROM ventas
    WHERE creado_en >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(creado_en)
    ORDER BY fecha ASC;
  `;

  // 6. Estadísticas adicionales de inventario
  const productosBajoStock = await prisma.varianteProducto.count({
    where: {
      estado: 'activo',
      cantidadStock: { lte: prisma.varianteProducto.fields.stockMinimo },
      stockMinimo: { gt: 0 }
    }
  });

  const productosSinStock = await prisma.varianteProducto.count({
    where: {
      estado: 'activo',
      cantidadStock: 0
    }
  });

  const valorTotalInventario = await prisma.varianteProducto.aggregate({
    _sum: {
      cantidadStock: true,
      precioCosto: true
    },
    where: { estado: 'activo' }
  });

  // 7. Total de productos únicos
  const totalProductos = await prisma.producto.count({
    where: { estado: 'activo' }
  });

  return {
    periodo: {
        rango,
        desde: fechaInicio.toISOString().split('T')[0]
    },
    resumenVentas: {
      totalVentas: ventasAgregadas._sum.total || 0,
      numeroVentas: ventasAgregadas._count.idVenta || 0
    },
    resumenCreditos: {
      saldoPendienteTotal: creditosAgregados._sum.saldoPendiente || 0,
      creditosActivos: creditosAgregados._count.idCredito || 0
    },
    nuevosClientes,
    topProductos,
    graficoVentas: ventasPorDia,
    resumenInventario: {
      productosBajoStock,
      productosSinStock,
      valorTotalInventario: (valorTotalInventario._sum.cantidadStock || 0) * (valorTotalInventario._sum.precioCosto || 0),
      totalProductos
    }
  };
}

// --- EXPORTACIÓN ---
module.exports = {
  obtenerResumen
};
