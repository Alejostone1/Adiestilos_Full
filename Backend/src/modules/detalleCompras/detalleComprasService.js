
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../../utils/errorHelper');

/**
 * Obtiene todos los detalles de una compra específica.
 * @param {number} idCompra - El ID de la compra.
 * @returns {Promise<Array>} - Una lista de los detalles de la compra.
 */
const obtenerDetallesPorCompraId = async (idCompra) => {
  try {
    return await prisma.detalleCompra.findMany({
      where: { idCompra: Number(idCompra) },
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
    handleError(error, 'No se pudieron obtener los detalles de la compra');
  }
};

/**
 * Obtiene un detalle de compra específico por su ID.
 * @param {number} id - El ID del detalle de compra.
 * @returns {Promise<Object>} - El detalle de compra encontrado.
 */
const obtenerDetalleCompraPorId = async (id) => {
  try {
    const detalleCompra = await prisma.detalleCompra.findUnique({
      where: { idDetalleCompra: Number(id) },
    });
    if (!detalleCompra) {
      throw new Error('Detalle de compra no encontrado');
    }
    return detalleCompra;
  } catch (error) {
    handleError(error, 'No se pudo obtener el detalle de la compra');
  }
};

/**
 * Crea un nuevo detalle de compra, actualiza el inventario y la compra.
 * @param {Object} detalleData - Los datos para crear el detalle de la compra.
 * @param {number} idUsuario - El ID del usuario que realiza la operación.
 * @returns {Promise<Object>} - El nuevo detalle de compra creado.
 */
const crearDetalleCompra = async (detalleData, idUsuario) => {
  const { idCompra, idVariante, cantidad, precioUnitario, descuentoLinea = 0 } = detalleData;

  if (!idCompra || !idVariante || !cantidad || !precioUnitario || cantidad <= 0 || precioUnitario <= 0) {
    throw new Error('idCompra, idVariante, cantidad y precioUnitario son requeridos y deben ser positivos.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Obtener la variante y la compra
    const variante = await tx.varianteProducto.findUnique({ where: { idVariante: Number(idVariante) } });
    if (!variante) throw new Error('La variante del producto no existe.');

    const compra = await tx.compra.findUnique({ where: { idCompra: Number(idCompra) } });
    if (!compra) throw new Error('La orden de compra no existe.');

    // 2. Obtener tipo de movimiento para "Compra"
    const tipoMovimientoCompra = await tx.tipoMovimiento.findFirst({
      where: { nombreTipo: 'Compra' },
    });
    if (!tipoMovimientoCompra) {
      throw new Error("Tipo de movimiento 'Compra' no encontrado. Configure los datos iniciales del sistema.");
    }
    
    // 3. Calcular totales para el detalle
    const subtotal = precioUnitario * cantidad;
    const totalLinea = subtotal - descuentoLinea;

    // 4. Crear el DetalleCompra
    const nuevoDetalle = await tx.detalleCompra.create({
      data: {
        idCompra: Number(idCompra),
        idVariante: Number(idVariante),
        cantidad: Number(cantidad),
        cantidadRecibida: Number(cantidad), // Asumimos que se recibe la cantidad total al crear el detalle
        precioUnitario: Number(precioUnitario),
        subtotal: subtotal,
        descuentoLinea: descuentoLinea,
        totalLinea: totalLinea,
      },
    });

    // 5. Actualizar el stock de la variante. 
    // Opcional: Se podría implementar lógica para actualizar el precioCosto (ej. promedio ponderado).
    // Por ahora, solo se actualiza el stock.
    const stockAnterior = variante.cantidadStock;
    const stockNuevo = Number(stockAnterior) + Number(cantidad);

    await tx.varianteProducto.update({
      where: { idVariante: Number(idVariante) },
      data: { cantidadStock: stockNuevo },
    });

    // 6. Registrar el movimiento de inventario
    await tx.movimientoInventario.create({
      data: {
        idVariante: Number(idVariante),
        idTipoMovimiento: tipoMovimientoCompra.idTipoMovimiento,
        idCompra: Number(idCompra),
        cantidad: Number(cantidad), // Cantidad que entra
        stockAnterior: stockAnterior,
        stockNuevo: stockNuevo,
        costoUnitario: Number(precioUnitario),
        valorTotal: totalLinea,
        usuarioRegistro: idUsuario,
      },
    });

    // 7. Actualizar los totales de la Compra
    const nuevoSubtotalCompra = Number(compra.subtotal) + subtotal;
    const nuevoDescuentoCompra = Number(compra.descuento) + descuentoLinea;
    const nuevoTotalCompra = nuevoSubtotalCompra - nuevoDescuentoCompra;

    await tx.compra.update({
      where: { idCompra: Number(idCompra) },
      data: {
        subtotal: nuevoSubtotalCompra,
        descuento: nuevoDescuentoCompra,
        total: nuevoTotalCompra,
      },
    });

    return nuevoDetalle;
  });
};


module.exports = {
  obtenerDetallesPorCompraId,
  obtenerDetalleCompraPorId,
  crearDetalleCompra,
};
