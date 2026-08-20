const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Crea un registro de crédito para una venta con saldo pendiente.
 * @param {object} tx - Instancia de transacción de Prisma
 * @param {object} datosCredito - Datos para el crédito (idVenta, idUsuario, montoTotal, montoInicial, saldoPendiente, usuarioRegistro)
 */
async function crearCreditoDesdeVenta(tx, datosCredito) {
    const { idVenta, idUsuario, montoTotal, montoInicial, saldoPendiente, usuarioRegistro } = datosCredito;

    // 1. Crear el registro en la tabla creditos
    const nuevoCredito = await tx.credito.create({
        data: {
            idVenta,
            idUsuario,
            montoTotal,
            montoInicial,
            montoCredito: saldoPendiente,
            totalAbonado: 0,
            saldoPendiente,
            fechaInicio: new Date(),
            fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
            usuarioRegistro,
            estado: 'activo'
        }
    });

    // 2. Actualizar o crear el resumen de crédito del cliente
    await tx.clientesCreditoResumen.upsert({
        where: { idUsuario },
        update: {
            creditoTotal: { increment: saldoPendiente },
            saldoTotal: { increment: saldoPendiente },
            cantidadCreditosActivos: { increment: 1 },
            fechaUltimoCredito: new Date(),
            fechaActualizacion: new Date()
        },
        create: {
            idUsuario,
            creditoTotal: saldoPendiente,
            saldoTotal: saldoPendiente,
            cantidadCreditosActivos: 1,
            fechaUltimoCredito: new Date()
        }
    });

    return nuevoCredito;
}

/**
 * Registra un abono a un crédito existente.
 */
async function registrarAbono(idVenta, datosAbono) {
    const { monto, idMetodoPago, usuarioRegistro, notas } = datosAbono;

    return await prisma.$transaction(async (tx) => {
        // 1. Obtener la venta y el crédito actual
        const venta = await tx.venta.findUnique({
            where: { idVenta },
            include: { credito: true }
        });

        if (!venta || !venta.credito) throw new Error('Venta o crédito no encontrado');
        if (venta.credito.estado === 'pagado') throw new Error('El crédito ya se encuentra pagado');

        const saldoAnterior = venta.credito.saldoPendiente;
        const nuevoSaldo = Number(saldoAnterior) - Number(monto);

        if (nuevoSaldo < 0) throw new Error('El monto del abono excede el saldo pendiente');

        // 2. Crear el registro del pago
        await tx.pago.create({
            data: {
                idVenta,
                tipoPago: nuevoSaldo === 0 ? 'liquidacion' : 'abono',
                monto,
                idMetodoPago,
                saldoAnterior,
                saldoNuevo: nuevoSaldo,
                usuarioRegistro,
                notas
            }
        });

        // 3. Actualizar la Venta (totalPagado y saldoPendiente)
        await tx.venta.update({
            where: { idVenta },
            data: {
                totalPagado: { increment: monto },
                saldoPendiente: nuevoSaldo,
                estadoPago: nuevoSaldo === 0 ? 'pagado' : 'parcial'
            }
        });

        // 4. Actualizar el Crédito
        const estadoCredito = nuevoSaldo === 0 ? 'pagado' : 'activo';
        await tx.credito.update({
            where: { idVenta },
            data: {
                totalAbonado: { increment: monto },
                saldoPendiente: nuevoSaldo,
                estado: estadoCredito,
                fechaUltimoPago: new Date()
            }
        });

        // 5. Actualizar el Resumen del Cliente
        await tx.clientesCreditoResumen.update({
            where: { idUsuario: venta.idUsuario },
            data: {
                totalAbonado: { increment: monto },
                saldoTotal: { decrement: monto },
                cantidadCreditosActivos: nuevoSaldo === 0 ? { decrement: 1 } : undefined,
                cantidadCreditosPagados: nuevoSaldo === 0 ? { increment: 1 } : undefined,
                fechaUltimoPago: new Date(),
                fechaActualizacion: new Date()
            }
        });

        return { exito: true, nuevoSaldo };
    });
}

/**
 * Obtener lista de créditos con filtros.
 */
async function obtenerCreditos(filtros = {}, paginacion = { page: 1, limit: 10 }) {
    const { page, limit } = paginacion;
    const skip = (page - 1) * limit;

    const [creditos, total] = await Promise.all([
        prisma.credito.findMany({
            where: filtros,
            include: {
                venta: {
                    select: {
                        numeroFactura: true,
                        total: true,
                        creadoEn: true
                    }
                },
                usuarioCliente: {
                    select: {
                        idUsuario: true,
                        nombres: true,
                        apellidos: true,
                        telefono: true
                    }
                }
            },
            orderBy: { fechaInicio: 'desc' },
            skip,
            take: limit
        }),
        prisma.credito.count({ where: filtros })
    ]);

    return {
        creditos,
        total,
        paginas: Math.ceil(total / limit),
        paginaActual: page
    };
}

module.exports = {
    crearCreditoDesdeVenta,
    registrarAbono,
    obtenerCreditos
};
