
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../../utils/errorHelper');
const resumenCreditoService = require('../clientesCreditoResumen/clientesCreditoResumenService');

/**
 * Crea una nueva solicitud de devolución (en estado 'pendiente').
 * @param {object} data - Datos de la devolución.
 * @param {number} data.idVenta - ID de la venta original.
 * @param {number} data.idUsuario - ID del cliente que solicita la devolución.
 * @param {string} data.motivo - Motivo de la devolución.
 * @param {Array<object>} data.detalles - Array de productos a devolver.
 * @param {number} data.detalles.idDetalleVenta - ID del detalle de venta original.
 * @param {number} data.detalles.cantidadDevuelta - Cantidad a devolver.
 * @returns {Promise<object>} La devolución creada.
 */
const crearDevolucion = async (data) => {
    const { idVenta, idUsuario, motivo, detalles, tipoDevolucion } = data;

    if (!idVenta || !idUsuario || !motivo || !detalles || detalles.length === 0) {
        throw new Error("Faltan datos requeridos para la devolución.");
    }

    return prisma.$transaction(async (tx) => {
        const ventaOriginal = await tx.venta.findUnique({
            where: { idVenta },
            include: { detalleVentas: true },
        });

        if (!ventaOriginal) throw new Error("La venta original no existe.");

        let subtotalDevolucion = 0;

        for (const detalle of detalles) {
            const detalleVentaOriginal = ventaOriginal.detalleVentas.find(
                (dv) => dv.idDetalleVenta === detalle.idDetalleVenta
            );

            if (!detalleVentaOriginal) {
                throw new Error(`El producto con detalle de venta ID ${detalle.idDetalleVenta} no pertenece a esta venta.`);
            }

            // Validar que no se devuelva más de lo comprado
            const yaDevuelto = await tx.detalleDevolucion.aggregate({
                _sum: { cantidadDevuelta: true },
                where: { idDetalleVenta: detalle.idDetalleVenta },
            });
            const cantidadYaDevuelta = yaDevuelto._sum.cantidadDevuelta || 0;

            if (detalle.cantidadDevuelta > (detalleVentaOriginal.cantidad - cantidadYaDevuelta)) {
                throw new Error(`Intenta devolver ${detalle.cantidadDevuelta} unidades del producto, pero solo puede devolver ${detalleVentaOriginal.cantidad - cantidadYaDevuelta} más.`);
            }
            subtotalDevolucion += detalle.cantidadDevuelta * detalleVentaOriginal.precioUnitario;
        }

        // Crear el encabezado de la devolución
        const nuevaDevolucion = await tx.devolucion.create({
            data: {
                numeroDevolucion: `DEV-${Date.now()}`,
                idVenta,
                idUsuario,
                tipoDevolucion,
                motivo,
                subtotalDevolucion,
                totalDevolucion: subtotalDevolucion, // Asumimos no hay impuestos en la devolución por simplicidad
                estado: 'pendiente',
                fechaDevolucion: new Date(),
                usuarioRegistro: idUsuario, 
            },
        });

        // Crear los detalles de la devolución
        await tx.detalleDevolucion.createMany({
            data: detalles.map(d => ({
                idDevolucion: nuevaDevolucion.idDevolucion,
                idDetalleVenta: d.idDetalleVenta,
                idVariante: ventaOriginal.detalleVentas.find(dv => dv.idDetalleVenta === d.idDetalleVenta).idVariante,
                cantidadDevuelta: d.cantidadDevuelta,
                precioUnitario: ventaOriginal.detalleVentas.find(dv => dv.idDetalleVenta === d.idDetalleVenta).precioUnitario,
                subtotal: d.cantidadDevuelta * ventaOriginal.detalleVentas.find(dv => dv.idDetalleVenta === d.idDetalleVenta).precioUnitario,
            }))
        });

        return nuevaDevolucion;
    });
};

/**
 * Cambia el estado de una devolución.
 * @param {number} idDevolucion - ID de la devolución.
 * @param {string} nuevoEstado - Nuevo estado ('aprobada', 'rechazada', 'procesada').
 * @returns {Promise<object>} La devolución actualizada.
 */
const cambiarEstadoDevolucion = async (idDevolucion, nuevoEstado) => {
    try {
        const devolucion = await prisma.devolucion.findUnique({ where: { idDevolucion } });
        if (!devolucion) throw new Error("La devolución no existe.");

        // Aquí iría la lógica de validación de transiciones de estado
        if (devolucion.estado === 'procesada' || devolucion.estado === 'rechazada') {
            throw new Error(`La devolución ya está en estado final (${devolucion.estado}) y no puede cambiar.`);
        }
        
        return await prisma.devolucion.update({
            where: { idDevolucion },
            data: { estado: nuevoEstado },
        });
    } catch(error) {
        handleError(error, "Error al cambiar el estado de la devolución");
    }
};

/**
 * Procesa una devolución 'aprobada', afectando inventario y finanzas.
 * @param {number} idDevolucion - ID de la devolución a procesar.
 * @param {number} idUsuarioRegistro - ID del usuario que procesa.
 * @returns {Promise<object>} La devolución procesada.
 */
const procesarDevolucion = async (idDevolucion, idUsuarioRegistro) => {
    return prisma.$transaction(async (tx) => {
        const devolucion = await tx.devolucion.findUnique({
            where: { idDevolucion },
            include: { detallesDevolucion: true, venta: true },
        });

        if (!devolucion) throw new Error("La devolución no existe.");
        if (devolucion.estado !== 'aprobada') throw new Error("Solo se pueden procesar devoluciones en estado 'aprobada'.");
        
        const tipoMovimiento = await tx.tipoMovimiento.findFirst({ where: { nombreTipo: 'Devolución Venta' }});
        if (!tipoMovimiento) throw new Error("Tipo de movimiento 'Devolución Venta' no configurado.");

        // 1. Afectar inventario por cada detalle
        for (const detalle of devolucion.detallesDevolucion) {
            const variante = await tx.varianteProducto.findUnique({ where: { idVariante: detalle.idVariante } });
            
            // 1a. Incrementar stock
            const stockAnterior = variante.cantidadStock;
            const stockNuevo = parseFloat(stockAnterior) + parseFloat(detalle.cantidadDevuelta);
            await tx.varianteProducto.update({
                where: { idVariante: detalle.idVariante },
                data: { cantidadStock: stockNuevo },
            });

            // 1b. Registrar movimiento de inventario
            await tx.movimientoInventario.create({
                data: {
                    idVariante: detalle.idVariante,
                    idTipoMovimiento: tipoMovimiento.idTipoMovimiento,
                    cantidad: detalle.cantidadDevuelta,
                    stockAnterior,
                    stockNuevo,
                    usuarioRegistro: idUsuarioRegistro,
                    motivo: `Devolución de venta #${devolucion.venta.numeroFactura}`,
                }
            });
        }

        // 2. Afectar finanzas (Crédito)
        const credito = await tx.credito.findUnique({ where: { idVenta: devolucion.idVenta } });
        if (credito) {
            const nuevoSaldoPendiente = parseFloat(credito.saldoPendiente) - parseFloat(devolucion.totalDevolucion);
            await tx.credito.update({
                where: { idCredito: credito.idCredito },
                data: {
                    montoTotal: { decrement: devolucion.totalDevolucion },
                    saldoPendiente: nuevoSaldoPendiente < 0 ? 0 : nuevoSaldoPendiente,
                }
            });
            // Re-sincronizar el resumen del cliente
            await resumenCreditoService.actualizarResumenCliente(devolucion.idUsuario, tx);
        }

        // 3. Actualizar estado de la devolución a 'procesada'
        return tx.devolucion.update({
            where: { idDevolucion },
            data: { estado: 'procesada' },
        });
    });
};


module.exports = {
    crearDevolucion,
    cambiarEstadoDevolucion,
    procesarDevolucion,
};
