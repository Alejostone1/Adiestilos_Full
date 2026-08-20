/**
 * Servicio para la lógica de negocio de Reportes de Ventas.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const { ErrorValidacion } = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Genera un reporte de ventas consolidado por diferentes criterios.
 * @param {object} opciones - Opciones para el reporte ({ fechaInicio, fechaFin, agruparPor }).
 * @returns {Promise<object>} Un objeto con los datos del reporte.
 */
async function generarReporteVentas(opciones) {
  const { fechaInicio, fechaFin, agruparPor = 'dia' } = opciones;

  if (!fechaInicio || !fechaFin) {
    throw new ErrorValidacion('Se requieren fecha de inicio y fecha de fin para el reporte.');
  }

  const where = {
    creadoEn: {
      gte: new Date(fechaInicio),
      lte: new Date(fechaFin)
    }
  };

  const resumenGeneral = await prisma.venta.aggregate({
    _sum: { total: true, subtotal: true, descuentoTotal: true, impuestos: true },
    _count: { idVenta: true },
    where
  });

  let dataAgrupada;

  switch (agruparPor) {
    case 'vendedor':
      dataAgrupada = await prisma.venta.groupBy({
        by: ['idUsuarioVendedor'],
        _sum: { total: true },
        _count: { idVenta: true },
        where,
        orderBy: { _sum: { total: 'desc' } }
      });
      // Enriquecer con datos del vendedor
      const idsVendedores = dataAgrupada.map(v => v.idUsuarioVendedor).filter(Boolean);
      const vendedores = await prisma.usuario.findMany({ where: { idUsuario: { in: idsVendedores } } });
      dataAgrupada.forEach(item => {
        item.vendedor = vendedores.find(v => v.idUsuario === item.idUsuarioVendedor);
      });
      break;

    case 'cliente':
        dataAgrupada = await prisma.venta.groupBy({
            by: ['idUsuario'],
            _sum: { total: true },
            _count: { idVenta: true },
            where,
            orderBy: { _sum: { total: 'desc' } }
        });
        const idsClientes = dataAgrupada.map(c => c.idUsuario);
        const clientes = await prisma.usuario.findMany({ where: { idUsuario: { in: idsClientes } } });
        dataAgrupada.forEach(item => {
            item.cliente = clientes.find(c => c.idUsuario === item.idUsuario);
        });
        break;

    case 'mes':
        dataAgrupada = await prisma.$queryRaw`
            SELECT
                TO_CHAR(creado_en, 'YYYY-MM') AS periodo,
                SUM(total) AS totalVentas,
                COUNT(id_venta)::INT AS numeroVentas
            FROM ventas
            WHERE creado_en BETWEEN ${new Date(fechaInicio)} AND ${new Date(fechaFin)}
            GROUP BY 1
            ORDER BY 1 ASC;
        `;
        break;

    case 'dia':
    default:
        dataAgrupada = await prisma.$queryRaw`
            SELECT
                CAST(creado_en AS DATE) AS periodo,
                SUM(total) AS totalVentas,
                COUNT(id_venta)::INT AS numeroVentas
            FROM ventas
            WHERE creado_en BETWEEN ${new Date(fechaInicio)} AND ${new Date(fechaFin)}
            GROUP BY 1
            ORDER BY 1 ASC;
        `;
        break;
  }

  return {
    parametros: { fechaInicio, fechaFin, agruparPor },
    resumen: {
      totalVentas: resumenGeneral._sum.total || 0,
      subtotal: resumenGeneral._sum.subtotal || 0,
      descuentos: resumenGeneral._sum.descuentoTotal || 0,
      impuestos: resumenGeneral._sum.impuestos || 0,
      numeroVentas: resumenGeneral._count.idVenta || 0,
    },
    detalleAgrupado: dataAgrupada
  };
}

// --- EXPORTACIÓN ---
module.exports = {
  generarReporteVentas
};
