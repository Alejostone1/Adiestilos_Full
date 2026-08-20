/**
 * Servicio para la lógica de negocio de Reportes de Créditos.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Genera un reporte sobre la cartera de créditos.
 * @param {object} opciones - Opciones para el reporte ({ estado }).
 * @returns {Promise<object>} Un objeto con los datos del reporte.
 */
async function generarReporteCreditos(opciones) {
  const { estado } = opciones;

  const where = {
    estado: estado || undefined,
  };

  const resumenCartera = await prisma.credito.aggregate({
    _sum: { saldoPendiente: true, montoCredito: true },
    _count: { idCredito: true },
    where
  });

  const listaCreditos = await prisma.credito.findMany({
    where,
    include: {
      usuarioCliente: { select: { nombres: true, apellidos: true, correoElectronico: true } },
        venta: { select: { numeroFactura: true, creadoEn: true } }
    },
    orderBy: {
      fechaVencimiento: 'asc'
    }
  });

  return {
    parametros: { estado: estado || 'todos' },
    resumen: {
      saldoPendienteTotal: resumenCartera._sum.saldoPendiente || 0,
      montoOriginalTotal: resumenCartera._sum.montoCredito || 0,
      numeroCreditos: resumenCartera._count.idCredito || 0,
    },
    creditos: listaCreditos
  };
}

// --- EXPORTACIÓN ---
module.exports = {
  generarReporteCreditos
};
