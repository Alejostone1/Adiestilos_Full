
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../../utils/errorHelper');

/**
 * Obtiene todos los detalles de una venta específica.
 * @param {number} idVenta - El ID de la venta.
 * @returns {Promise<Array>} - Una lista de los detalles de la venta.
 */
const obtenerDetallesPorVentaId = async (idVenta) => {
  try {
    return await prisma.detalleVenta.findMany({
      where: { idVenta: Number(idVenta) },
      include: {
        variante: {
          include: {
            producto: {
              select: { nombreProducto: true, codigoReferencia: true },
            },
            color: { select: { nombreColor: true } },
            talla: { select: { nombreTalla: true } },
          },
        },
      },
    });
  } catch (error) {
    handleError(error, 'No se pudieron obtener los detalles de la venta');
  }
};

/**
 * Obtiene un detalle de venta específico por su ID.
 * @param {number} id - El ID del detalle de venta.
 * @returns {Promise<Object>} - El detalle de venta encontrado.
 */
const obtenerDetalleVentaPorId = async (id) => {
  try {
    const detalleVenta = await prisma.detalleVenta.findUnique({
      where: { idDetalleVenta: Number(id) },
    });
    if (!detalleVenta) {
      throw new Error('Detalle de venta no encontrado');
    }
    return detalleVenta;
  } catch (error) {
    handleError(error, 'No se pudo obtener el detalle de la venta');
  }
};

/**
 * Crea un nuevo detalle de venta y actualiza el inventario y la venta.
 * @param {Object} detalleData - Los datos para crear el detalle de la venta.
 * @param {number} idUsuario - El ID del usuario que realiza la operación.
 * @returns {Promise<Object>} - El nuevo detalle de venta creado.
 */
const crearDetalleVenta = async (detalleData, idUsuario) => {
  const { idVenta, idVariante, cantidad } = detalleData;

  if (!idVenta || !idVariante || !cantidad || cantidad <= 0) {
    throw new Error('idVenta, idVariante y cantidad son requeridos y la cantidad debe ser positiva.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Obtener la variante y verificar stock
    const variante = await tx.varianteProducto.findUnique({
      where: { idVariante: Number(idVariante) },
    });

    if (!variante) {
      throw new Error('La variante del producto no existe.');
    }

    if (variante.cantidadStock < cantidad) {
      throw new Error(`Stock insuficiente para la variante ${variante.codigoSku}. Stock disponible: ${variante.cantidadStock}`);
    }

    // 2. Obtener tipo de movimiento para "Venta"
    const tipoMovimientoVenta = await tx.tipoMovimiento.findFirst({
      where: { nombreTipo: 'Venta' },
    });

    if (!tipoMovimientoVenta) {
      // Esto es un problema de configuración, el seed debió crearlo.
      throw new Error("Tipo de movimiento 'Venta' no encontrado. Por favor, configure los datos iniciales del sistema.");
    }
    
    // 3. Calcular totales para el detalle
    const precioUnitario = variante.precioVenta;
    const subtotal = precioUnitario * cantidad;
    // Asumimos que el descuento de línea se manejará en otro lugar o es 0 por defecto.
    const descuentoLinea = detalleData.descuentoLinea || 0;
    const totalLinea = subtotal - descuentoLinea;

    // 4. Crear el DetalleVenta
    const nuevoDetalle = await tx.detalleVenta.create({
      data: {
        idVenta: Number(idVenta),
        idVariante: Number(idVariante),
        cantidad: Number(cantidad),
        precioUnitario: precioUnitario,
        subtotal: subtotal,
        descuentoLinea: descuentoLinea,
        totalLinea: totalLinea,
      },
    });

    // 5. Actualizar el stock de la variante
    const stockAnterior = variante.cantidadStock;
    const stockNuevo = stockAnterior - cantidad;

    await tx.varianteProducto.update({
      where: { idVariante: Number(idVariante) },
      data: { cantidadStock: stockNuevo },
    });

    // 6. Registrar el movimiento de inventario
    await tx.movimientoInventario.create({
      data: {
        idVariante: Number(idVariante),
        idTipoMovimiento: tipoMovimientoVenta.idTipoMovimiento,
        idVenta: Number(idVenta),
        cantidad: Number(cantidad), // Cantidad que sale
        stockAnterior: stockAnterior,
        stockNuevo: stockNuevo,
        costoUnitario: variante.precioCosto, // Guardamos el costo para análisis de rentabilidad
        valorTotal: variante.precioCosto * cantidad,
        usuarioRegistro: idUsuario,
      },
    });

    // 7. Actualizar los totales de la Venta
    const ventaActual = await tx.venta.findUnique({ where: { idVenta: Number(idVenta) } });
    
    const nuevoSubtotalVenta = Number(ventaActual.subtotal) + subtotal;
    const nuevoDescuentoTotal = Number(ventaActual.descuentoTotal) + descuentoLinea;
    const nuevoTotalVenta = nuevoSubtotalVenta - nuevoDescuentoTotal; // Recalcular total
    const nuevoSaldoPendiente = nuevoTotalVenta - Number(ventaActual.totalPagado);

    await tx.venta.update({
      where: { idVenta: Number(idVenta) },
      data: {
        subtotal: nuevoSubtotalVenta,
        descuentoTotal: nuevoDescuentoTotal,
        total: nuevoTotalVenta,
        saldoPendiente: nuevoSaldoPendiente,
      },
    });

    return nuevoDetalle;
  });
};


module.exports = {
  obtenerDetallesPorVentaId,
  obtenerDetalleVentaPorId,
  crearDetalleVenta,
};
