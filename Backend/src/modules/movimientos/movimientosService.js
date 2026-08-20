
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError, ErrorValidacion, ErrorNoEncontrado } = require('../../utils/errorHelper');

/**
 * Obtiene una lista de movimientos de inventario con filtros y paginación.
 *
 * @param {object} filters - Opciones de filtrado.
 * @param {number} [filters.idVariante] - Filtrar por ID de variante de producto.
 * @param {number} [filters.idProducto] - Filtrar por ID de producto (afecta a todas sus variantes).
 * @param {number} [filters.idTipoMovimiento] - Filtrar por el tipo de movimiento.
 * @param {number} [filters.idCompra] - Filtrar por el ID de la compra de origen.
 * @param {number} [filters.idVenta] - Filtrar por el ID de la venta de origen.
 * @param {number} [filters.idUsuario] - Filtrar por el ID del usuario que registró el movimiento.
 * @param {string} [filters.fechaInicio] - Fecha de inicio para el rango de búsqueda (YYYY-MM-DD).
 * @param {string} [filters.fechaFin] - Fecha de fin para el rango de búsqueda (YYYY-MM-DD).
 * @param {number} [page=1] - Número de página.
 * @param {number} [pageSize=10] - Cantidad de resultados por página.
 * @returns {Promise<object>} - Un objeto con la lista de movimientos y la información de paginación.
 */
const obtenerMovimientos = async (filters = {}, page = 1, pageSize = 10) => {
  try {
    const {
      idVariante,
      idProducto,
      idTipoMovimiento,
      idCompra,
      idVenta,
      idUsuario,
      fechaInicio,
      fechaFin,
      search
    } = filters;

    const where = {};

    if (idVariante) where.idVariante = Number(idVariante);
    if (idTipoMovimiento) where.idTipoMovimiento = Number(idTipoMovimiento);
    if (idCompra) where.idCompra = Number(idCompra);
    if (idVenta) where.idVenta = Number(idVenta);
    if (idUsuario) where.usuarioRegistro = Number(idUsuario);

    // Búsqueda por término (nombre producto o SKU)
    if (search) {
      where.OR = [
        {
          variante: {
            producto: {
              nombreProducto: { contains: search }
            }
          }
        },
        {
          variante: {
            codigoSku: { contains: search }
          }
        },
        {
          motivo: { contains: search }
        }
      ];
    }

    // Si se filtra por producto, encontramos todas sus variantes
    if (idProducto) {
      const variantes = await prisma.varianteProducto.findMany({
        where: { idProducto: Number(idProducto) },
        select: { idVariante: true },
      });
      const idsVariantes = variantes.map(v => v.idVariante);
      if (idsVariantes.length > 0) {
        if (where.idVariante) {
            // Si ya hay un idVariante (poco común si hay idProducto), usamos AND
            where.AND = [
                { idVariante: where.idVariante },
                { idVariante: { in: idsVariantes } }
            ];
            delete where.idVariante;
        } else {
            where.idVariante = { in: idsVariantes };
        }
      } else {
        // Si el producto no tiene variantes, no habrá movimientos.
        return { movimientos: [], total: 0, page, pageSize, totalPages: 0 };
      }
    }

    if (fechaInicio || fechaFin) {
      where.fechaMovimiento = {};
      if (fechaInicio) where.fechaMovimiento.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaMovimiento.lte = new Date(new Date(fechaFin).setHours(23, 59, 59, 999)); // Incluir todo el día
    }

    const skip = (page - 1) * pageSize;

    const [movimientos, total] = await prisma.$transaction([
      prisma.movimientoInventario.findMany({
        where,
        include: {
          variante: {
            include: {
              producto: { select: { nombreProducto: true } },
              color: { select: { nombreColor: true } },
              talla: { select: { nombreTalla: true } },
            },
          },
          tipoMovimiento: { select: { nombreTipo: true, tipo: true } },
          usuarioRegistroRef: { select: { usuario: true } },
          compra: { select: { numeroCompra: true } },
          venta: { select: { numeroFactura: true } },
          ajuste: { select: { numeroAjuste: true } },
        },
        orderBy: {
          fechaMovimiento: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.movimientoInventario.count({ where }),
    ]);

    return {
      movimientos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    handleError(error, 'No se pudieron obtener los movimientos de inventario');
  }
};

/**
 * Obtiene un movimiento de inventario específico por su ID.
 * @param {number} id - El ID del movimiento.
 * @returns {Promise<Object>} - El movimiento de inventario encontrado.
 */
const obtenerMovimientoPorId = async (id) => {
    try {
        const movimiento = await prisma.movimientoInventario.findUnique({
            where: { idMovimiento: Number(id) },
            include: {
                variante: {
                  include: {
                    producto: true,
                    color: true,
                    talla: true
                  }
                },
                tipoMovimiento: true,
                usuarioRegistroRef: true,
                compra: true,
                venta: true,
                ajuste: true,
            }
        });

        if (!movimiento) {
            throw new Error('Movimiento de inventario no encontrado');
        }
        return movimiento;
    } catch (error) {
        handleError(error, 'No se pudo obtener el movimiento de inventario');
    }
}


/**
 * Crea un movimiento de inventario y actualiza el stock de la variante correspondiente.
 * Esta función está diseñada para ser llamada exclusivamente desde dentro de una transacción de Prisma.
 *
 * @param {object} tx - El cliente de transacción de Prisma.
 * @param {object} datosMovimiento - Los datos para crear el movimiento.
 * @param {number} datosMovimiento.idVariante - ID de la variante de producto afectada.
 * @param {number} datosMovimiento.cantidad - La cantidad a mover (positiva para entradas, negativa para salidas).
 * @param {number} datosMovimiento.idTipoMovimiento - ID del tipo de movimiento.
 * @param {number} datosMovimiento.usuarioRegistro - ID del usuario que registra el movimiento.
 * @param {string} datosMovimiento.motivo - Descripción o motivo del movimiento.
 * @param {number} [datosMovimiento.idCompra] - ID de la compra asociada (opcional).
 * @param {number} [datosMovimiento.idVenta] - ID de la venta asociada (opcional).
 * @param {number} [datosMovimiento.idAjuste] - ID del ajuste asociado (opcional).
 * @returns {Promise<object>} El registro del movimiento de inventario creado.
 */
async function crearMovimiento(tx, datosMovimiento) {
  const {
    idVariante,
    cantidad,
    idTipoMovimiento,
    usuarioRegistro,
    motivo,
    idCompra,
    idVenta,
    idAjuste,
  } = datosMovimiento;

  if (!idVariante || cantidad === undefined || !idTipoMovimiento || !usuarioRegistro) {
    throw new ErrorValidacion('Faltan datos requeridos para registrar el movimiento de inventario.');
  }

  // 1. Obtener el stock actual y bloquear la fila de la variante
  const variante = await tx.varianteProducto.findUnique({
    where: { idVariante },
  });

  if (!variante) {
    throw new ErrorNoEncontrado('variante', idVariante);
  }

  const stockAnterior = Number(variante.cantidadStock);
  const cantidadNumerica = Number(cantidad);
  const stockNuevo = stockAnterior + cantidadNumerica;

  // 2. Validar que el stock no sea negativo para movimientos de salida
  if (cantidadNumerica < 0 && stockNuevo < 0) {
    throw new ErrorValidacion(`Stock insuficiente para la variante ${variante.codigoSku || idVariante}. Stock actual: ${stockAnterior}, se intentan sacar: ${Math.abs(cantidadNumerica)}.`);
  }

  // 3. Actualizar el stock en la tabla de variantes
  await tx.varianteProducto.update({
    where: { idVariante },
    data: { cantidadStock: stockNuevo },
  });

  // 4. Crear el registro en la tabla de movimientos de inventario
  const movimientoCreado = await tx.movimientoInventario.create({
    data: {
      idVariante,
      idTipoMovimiento,
      cantidad: cantidadNumerica,
      stockAnterior,
      stockNuevo,
      motivo,
      usuarioRegistro,
      idCompra: idCompra || null,
      idVenta: idVenta || null,
      idAjuste: idAjuste || null,
    },
  });

  return movimientoCreado;
}


module.exports = {
  obtenerMovimientos,
  obtenerMovimientoPorId,
  crearMovimiento,
};

