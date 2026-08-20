
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../../utils/errorHelper');

/**
 * Recalcula y actualiza la tabla de resumen de crédito para un cliente específico.
 * Esta función es el corazón del módulo y está diseñada para ser llamada
 * desde otros servicios (créditos, pagos) dentro de una transacción.
 * @param {number} idUsuario - El ID del usuario a actualizar.
 * @param {object} [tx] - El cliente de transacción de Prisma (opcional).
 * @returns {Promise<object>} El resumen de crédito actualizado.
 */
const actualizarResumenCliente = async (idUsuario, tx) => {
  const prismaClient = tx || prisma;

  try {
    const creditos = await prismaClient.credito.findMany({
      where: { idUsuario: Number(idUsuario) },
    });

    if (creditos.length === 0) {
      // Si no hay créditos, se puede limpiar el resumen o dejarlo como está.
      // Optamos por actualizar a ceros para consistencia.
      return await prismaClient.clientesCreditoResumen.upsert({
        where: { idUsuario: Number(idUsuario) },
        update: {
          creditoTotal: 0,
          totalAbonado: 0,
          saldoTotal: 0,
          cantidadCreditosActivos: 0,
          cantidadCreditosVencidos: 0,
          cantidadCreditosPagados: 0,
        },
        create: {
          idUsuario: Number(idUsuario),
          limiteCredito: 500000, // Límite por defecto, debería ser configurable
        },
      });
    }

    const aggregates = creditos.reduce((acc, credito) => {
        acc.creditoTotal += parseFloat(credito.montoCredito);
        acc.totalAbonado += parseFloat(credito.totalAbonado);
        if (credito.estado === 'activo') acc.cantidadCreditosActivos++;
        if (credito.estado === 'vencido') acc.cantidadCreditosVencidos++;
        if (credito.estado === 'pagado') acc.cantidadCreditosPagados++;
        if (!acc.fechaUltimoCredito || credito.creadoEn > acc.fechaUltimoCredito) {
            acc.fechaUltimoCredito = credito.creadoEn;
        }
        if (credito.fechaUltimoPago && (!acc.fechaUltimoPago || credito.fechaUltimoPago > acc.fechaUltimoPago)) {
            acc.fechaUltimoPago = credito.fechaUltimoPago;
        }
        return acc;
    }, {
        creditoTotal: 0,
        totalAbonado: 0,
        cantidadCreditosActivos: 0,
        cantidadCreditosVencidos: 0,
        cantidadCreditosPagados: 0,
        fechaUltimoCredito: null,
        fechaUltimoPago: null,
    });

    const saldoTotal = aggregates.creditoTotal - aggregates.totalAbonado;

    return await prismaClient.clientesCreditoResumen.upsert({
        where: { idUsuario: Number(idUsuario) },
        update: {
            creditoTotal: aggregates.creditoTotal,
            totalAbonado: aggregates.totalAbonado,
            saldoTotal: saldoTotal,
            cantidadCreditosActivos: aggregates.cantidadCreditosActivos,
            cantidadCreditosVencidos: aggregates.cantidadCreditosVencidos,
            cantidadCreditosPagados: aggregates.cantidadCreditosPagados,
            fechaUltimoCredito: aggregates.fechaUltimoCredito,
            fechaUltimoPago: aggregates.fechaUltimoPago,
        },
        create: {
            idUsuario: Number(idUsuario),
            creditoTotal: aggregates.creditoTotal,
            totalAbonado: aggregates.totalAbonado,
            saldoTotal: saldoTotal,
            cantidadCreditosActivos: aggregates.cantidadCreditosActivos,
            cantidadCreditosVencidos: aggregates.cantidadCreditosVencidos,
            cantidadCreditosPagados: aggregates.cantidadCreditosPagados,
            fechaUltimoCredito: aggregates.fechaUltimoCredito,
            fechaUltimoPago: aggregates.fechaUltimoPago,
            limiteCredito: 500000, // Límite por defecto
        },
    });

  } catch (error) {
    handleError(error, `Error al actualizar el resumen de crédito para el usuario ${idUsuario}`);
  }
};

/**
 * Obtiene el resumen crediticio de un cliente.
 * @param {number} idUsuario - El ID del usuario.
 * @returns {Promise<object>} El resumen crediticio.
 */
const obtenerResumenCrediticio = async (idUsuario) => {
  try {
    let resumen = await prisma.clientesCreditoResumen.findUnique({
      where: { idUsuario: Number(idUsuario) },
    });
    if (!resumen) {
        // Si no existe, lo creamos on-the-fly para asegurar que siempre haya una respuesta.
        resumen = await actualizarResumenCliente(idUsuario);
    }
    return resumen;
  } catch (error) {
    handleError(error, 'Error al obtener el resumen crediticio');
  }
};

/**
 * Obtiene una lista de clientes con saldos pendientes.
 * @returns {Promise<Array>} Lista de resúmenes de clientes con deudas.
 */
const listarClientesConSaldos = async () => {
    try {
        return await prisma.clientesCreditoResumen.findMany({
            where: {
                saldoTotal: {
                    gt: 0,
                },
            },
            include: {
                usuario: {
                    select: {
                        nombres: true,
                        apellidos: true,
                        usuario: true,
                        correoElectronico: true,
                    }
                }
            },
            orderBy: {
                saldoTotal: 'desc',
            }
        });
    } catch (error) {
        handleError(error, 'Error al listar clientes con saldos pendientes');
    }
};

/**
 * Obtiene el límite de crédito disponible para un cliente.
 * @param {number} idUsuario - El ID del usuario.
 * @returns {Promise<number>} El monto de crédito disponible.
 */
const obtenerLimiteDeCreditoDisponible = async (idUsuario) => {
    try {
        const resumen = await obtenerResumenCrediticio(idUsuario);
        const limite = resumen.limiteCredito || 0;
        const saldoTotal = resumen.saldoTotal || 0;
        const disponible = parseFloat(limite) - parseFloat(saldoTotal);
        return disponible > 0 ? disponible : 0;
    } catch(error) {
        handleError(error, 'Error al calcular el límite de crédito disponible');
    }
}

module.exports = {
  actualizarResumenCliente,
  obtenerResumenCrediticio,
  listarClientesConSaldos,
  obtenerLimiteDeCreditoDisponible
};
