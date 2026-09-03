/**
 * Servicio para la lógica de negocio de Compras.
 * Maneja la creación de órdenes de compra y la recepción de mercancía,
 * actualizando el inventario de forma transaccional.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const {
  ErrorNoEncontrado,
  ErrorValidacion,
  ErrorConflicto
} = require('../../utils/errorHelper');

// --- OBJETOS DE INCLUSIÓN REUTILIZABLES ---

const includeRelacionesCompra = {
  proveedor: true,
  usuarioRegistro: { select: { idUsuario: true, nombres: true, apellidos: true } },
  estadoPedido: true,
  detalleCompras: {
    include: {
      variante: {
        include: {
          producto: { 
            include: {
              imagenes: true
            }
          },
          color: true,
          talla: true,
          imagenesVariantes: true
        }
      }
    }
  }
};

// --- FUNCIONES DEL SERVICIO ---

/**
 * Crea una nueva orden de compra.
 * @param {object} datos - Los datos de la nueva compra.
 * @returns {Promise<object>} La orden de compra creada.
 */
async function crear(datos) {
  const { idProveedor, fechaCompra, detalleCompras, idUsuarioRegistro, impuestos, numeroCompra, notas, fechaEntrega } = datos;

  if (!idProveedor || !fechaCompra || !detalleCompras || detalleCompras.length === 0) {
    throw new ErrorValidacion('Faltan datos requeridos: proveedor, fecha y detalles de la compra.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Validar que el proveedor exista
    const proveedor = await tx.proveedor.findUnique({ where: { idProveedor } });
    if (!proveedor) throw new ErrorNoEncontrado(`El proveedor con ID ${idProveedor} no existe.`);

    let subtotalCompra = 0;
    let descuentoTotalCompra = 0;

    // 2. Validar cada item del detalle y calcular totales
    for (const item of detalleCompras) {
      const variante = await tx.varianteProducto.findUnique({
        where: { idVariante: item.idVariante },
        include: { producto: true }
      });
      if (!variante) throw new ErrorNoEncontrado(`La variante con ID ${item.idVariante} no existe.`);
      if (variante.producto.idProveedor !== idProveedor) {
        throw new ErrorConflicto(`El producto '${variante.producto.nombreProducto}' no pertenece al proveedor seleccionado.`);
      }

      // Calcular subtotal de la línea (cantidad * precio unitario)
      const subtotalLinea = item.cantidad * item.precioUnitario;
      
      // Obtener descuento de la línea (puede ser 0)
      const descuentoLinea = item.descuentoLinea || 0;
      
      // Calcular total de la línea (subtotal - descuento)
      const totalLinea = subtotalLinea - descuentoLinea;

      // Validar que el descuento no sea mayor al subtotal
      if (descuentoLinea > subtotalLinea) {
        throw new ErrorValidacion(`El descuento ($${descuentoLinea}) no puede ser mayor al subtotal ($${subtotalLinea}) para la variante ${item.idVariante}.`);
      }

      // Asignar valores calculados al item
      item.subtotal = subtotalLinea;
      item.descuentoLinea = descuentoLinea;
      item.totalLinea = totalLinea;

      // Acumular totales de la compra
      subtotalCompra += subtotalLinea;
      descuentoTotalCompra += descuentoLinea;
    }

    const impuestosCompra = impuestos || 0;
    const totalCompra = (subtotalCompra - descuentoTotalCompra) + impuestosCompra;

    // 3. Crear la orden de compra
    const numCompraFinal = numeroCompra || `OC-${Date.now()}`;
    const nuevaCompra = await tx.compra.create({
      data: {
        numeroCompra: numCompraFinal,
        idProveedor,
        idUsuarioRegistro,
        fechaCompra: new Date(fechaCompra),
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
        subtotal: subtotalCompra,
        descuento: descuentoTotalCompra,
        impuestos: impuestosCompra,
        total: totalCompra,
        idEstadoPedido: 8, // Default: Compra recibida (se actualiza stock inmediatamente)
        notas: notas || null
      }
    });

    // 4. Obtener tipo de movimiento para entrada por compra
    const tipoMovimiento = await tx.tipoMovimiento.findFirst({ 
      where: { tipo: 'entrada' } 
    });
    if (!tipoMovimiento) throw new ErrorValidacion('No se encontró el tipo de movimiento "entrada".');

    // 5. Crear el detalle de la compra y actualizar inventario
    for (const item of detalleCompras) {
      // Crear el detalle de compra
      await tx.detalleCompra.create({
        data: {
          idCompra: nuevaCompra.idCompra,
          idVariante: item.idVariante,
          cantidad: item.cantidad,
          cantidadRecibida: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          descuentoLinea: item.descuentoLinea,
          totalLinea: item.totalLinea,
        }
      });

      // Actualizar stock de la variante
      const variante = await tx.varianteProducto.findUnique({ 
        where: { idVariante: item.idVariante } 
      });
      const stockAnterior = variante.cantidadStock;
      const stockNuevo = stockAnterior + item.cantidad;

      await tx.varianteProducto.update({
        where: { idVariante: item.idVariante },
        data: { cantidadStock: stockNuevo }
      });

      // Registrar movimiento de inventario
      await tx.movimientoInventario.create({
        data: {
          idVariante: item.idVariante,
          idTipoMovimiento: tipoMovimiento.idTipoMovimiento,
          idCompra: nuevaCompra.idCompra,
          cantidad: item.cantidad,
          stockAnterior,
          stockNuevo,
          usuarioRegistro: idUsuarioRegistro,
          motivo: `Compra #${numCompraFinal}`,
          costoUnitario: item.precioUnitario,
          valorTotal: item.totalLinea
        }
      });
    }

    // 6. Devolver la compra completa
    return tx.compra.findUnique({
      where: { idCompra: nuevaCompra.idCompra },
      include: includeRelacionesCompra
    });
  });
}

/**
 * Obtiene una lista paginada de compras.
 * @param {object} [filtros={}] - Opciones de filtrado.
 * @param {object} [paginacion] - Opciones de paginación.
 * @returns {Promise<object>} Objeto con lista de compras y paginación.
 */
async function obtenerTodas(filtros = {}, paginacion = { pagina: 1, limite: 10 }) {
  const { idProveedor, estado } = filtros;
  const { pagina, limite } = paginacion;
  const skip = (Number(pagina) - 1) * Number(limite);

  const where = {
    AND: [
      idProveedor && { idProveedor: Number(idProveedor) },
      estado && { idEstadoPedido: Number(estado) },
    ].filter(Boolean)
  };

  const [compras, total] = await prisma.$transaction([
    prisma.compra.findMany({
      where,
      include: includeRelacionesCompra,
      skip,
      take: Number(limite),
      orderBy: { fechaCompra: 'desc' }
    }),
    prisma.compra.count({ where })
  ]);

  return {
    datos: compras,
    paginacion: { 
      totalRegistros: total, 
      paginaActual: Number(pagina), 
      registrosPorPagina: Number(limite),
      totalPaginas: Math.ceil(total / Number(limite)) 
    }
  };
}

/**
 * Obtiene una compra específica por su ID.
 * @param {number} id - El ID de la compra.
 * @returns {Promise<object>} La compra encontrada.
 */
async function obtenerPorId(id) {
  const idCompra = parseInt(id, 10);
  if (isNaN(idCompra)) throw new ErrorValidacion('El ID de compra debe ser un número.');

  const compra = await prisma.compra.findUnique({
    where: { idCompra },
    include: includeRelacionesCompra
  });

  if (!compra) throw new ErrorNoEncontrado(`Compra con ID ${idCompra} no encontrada.`);
  return compra;
}

/**
 * Procesa la recepción de una compra, actualizando el inventario.
 * @param {number} idCompra - El ID de la compra a recibir.
 * @param {number} idUsuario - El ID del usuario que registra la recepción.
 * @param {Array} [detallesRecibidos] - Opcional. Array para recepciones parciales.
 * @returns {Promise<object>} La compra actualizada.
 */
async function recibir(idCompra, idUsuario, detallesRecibidos) {
  const idCompraNum = parseInt(idCompra, 10);

  return prisma.$transaction(async (tx) => {
    // 1. Obtener la compra y bloquearla
    const compra = await tx.compra.findUnique({
      where: { idCompra: idCompraNum },
      include: { detalleCompras: true }
    });

    if (!compra) throw new ErrorNoEncontrado(`Compra con ID ${idCompraNum} no encontrada.`);
    if (compra.idEstadoPedido === 8) throw new ErrorConflicto('Esta compra ya ha sido recibida en su totalidad.');
    if (compra.idEstadoPedido === 7) throw new ErrorConflicto('No se puede recibir una compra cancelada.');

    const tipoMovimiento = await tx.tipoMovimiento.findFirst({ where: { tipo: 'entrada' } });
    if (!tipoMovimiento) throw new ErrorValidacion('No se encontró el tipo de movimiento "entrada".');

    let cantidadTotalRecibida = 0;
    
    // 2. Iterar sobre los detalles y actualizar inventario
    for (const detalle of compra.detalleCompras) {
      const detalleRecepcion = detallesRecibidos?.find(d => d.idDetalleCompra === detalle.idDetalleCompra);
      const cantidadARecibir = detalleRecepcion ? detalleRecepcion.cantidad : (detalle.cantidad - detalle.cantidadRecibida);

      if (cantidadARecibir <= 0) continue;
      if (cantidadARecibir > (detalle.cantidad - detalle.cantidadRecibida)) {
          throw new ErrorValidacion(`Intenta recibir más de lo pendiente para el item ${detalle.idDetalleCompra}`);
      }
      
      const variante = await tx.varianteProducto.findUnique({ where: { idVariante: detalle.idVariante } });
      const stockAnterior = variante.cantidadStock;
      const stockNuevo = stockAnterior + cantidadARecibir;

      // Actualizar inventario
      await tx.varianteProducto.update({
        where: { idVariante: detalle.idVariante },
        data: { cantidadStock: { increment: cantidadARecibir } }
      });

      // Registrar movimiento de inventario
      await tx.movimientoInventario.create({
        data: {
          idVariante: detalle.idVariante,
          idTipoMovimiento: tipoMovimiento.idTipoMovimiento,
          idCompra: compra.idCompra,
          cantidad: cantidadARecibir,
          stockAnterior,
          stockNuevo,
          usuarioRegistro: idUsuario,
          motivo: `Recepción de compra #${compra.numeroCompra}`
        }
      });
      
      // Actualizar la cantidad recibida en el detalle de la compra
      await tx.detalleCompra.update({
          where: { idDetalleCompra: detalle.idDetalleCompra },
          data: { cantidadRecibida: { increment: cantidadARecibir } }
      });

      cantidadTotalRecibida += cantidadARecibir;
    }

    if (cantidadTotalRecibida === 0 && !detallesRecibidos) {
        throw new ErrorValidacion("No hay cantidades pendientes de recibir en esta compra.");
    }

    // 3. Actualizar el estado de la compra
    const detallesActualizados = await tx.detalleCompra.findMany({ where: { idCompra: compra.idCompra } });
    const todoRecibido = detallesActualizados.every(d => d.cantidad === d.cantidadRecibida);
    const nuevoIdEstado = todoRecibido ? 8 : 10; // 8 = Recibido, 10 = Parcialmente Recibido

    const compraActualizada = await tx.compra.update({
      where: { idCompra: compra.idCompra },
      data: { 
          idEstadoPedido: nuevoIdEstado,
          fechaEntrega: new Date()
      },
      include: includeRelacionesCompra
    });

    return compraActualizada;
  });
}

/**
 * Actualiza el estado de una compra.
 * @param {number} id - El ID de la compra.
 * @param {number} idEstadoPedido - El nuevo ID de estado.
 * @returns {Promise<object>} La compra actualizada.
 */
async function actualizarEstado(id, idEstadoPedido) {
  const idCompra = parseInt(id, 10);
  const idEstado = parseInt(idEstadoPedido, 10);

  if (isNaN(idCompra) || isNaN(idEstado)) {
    throw new ErrorValidacion('Los IDs deben ser números.');
  }

  return prisma.compra.update({
    where: { idCompra },
    data: { idEstadoPedido: idEstado },
    include: includeRelacionesCompra
  });
}

// --- EXPORTACIÓN ---
module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  recibir,
  actualizarEstado
};
