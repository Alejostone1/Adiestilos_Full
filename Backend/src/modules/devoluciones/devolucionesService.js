/**
 * Servicio para la lógica de negocio de Devoluciones.
 * Maneja la creación y consulta de devoluciones, actualizando el inventario
 * y gestionando las implicaciones financieras de forma transaccional.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const {
  ErrorNoEncontrado,
  ErrorValidacion,
  ErrorConflicto,
  ErrorAutorizacion
} = require('../../utils/errorHelper');
const movimientosService = require('../movimientos/movimientosService');

// --- OBJETOS DE INCLUSIÓN REUTILIZABLES ---

const includeRelacionesDevolucion = {
  usuarioCliente: { select: { idUsuario: true, nombres: true, apellidos: true, correoElectronico: true } },
  usuarioRegistroRef: { select: { idUsuario: true, nombres: true, apellidos: true } },
  venta: { select: { idVenta: true, numeroFactura: true } },
  detalleDevoluciones: {
    include: {
      variante: {
        include: {
          producto: { 
            include: {
              imagenes: {
                where: { esPrincipal: true },
                take: 1
              }
            }
          },
          color: true,
          talla: true,
          imagenesVariantes: {
            where: { esPrincipal: true },
            take: 1
          }
        }
      },
      detalleVenta: {
        select: { idDetalleVenta: true, cantidad: true, precioUnitario: true }
      }
    }
  }
};

// --- FUNCIONES DEL SERVICIO ---

/**
 * Crea una nueva devolución de forma transaccional.
 * Afecta el inventario y puede generar una nota de crédito o reembolso.
 * @param {object} datos - Los datos de la nueva devolución.
 * @returns {Promise<object>} La devolución creada.
 */
async function crear(datos) {
  const {
    idVenta,
    motivo,
    observaciones,
    detalleDevoluciones, // Array de { idDetalleVenta, cantidadDevuelta }
    usuarioRegistro
  } = datos;

  if (!idVenta || !motivo || !detalleDevoluciones || detalleDevoluciones.length === 0) {
    throw new ErrorValidacion('Faltan datos requeridos: idVenta, motivo y detalles de la devolución.');
  }

  // ---- INICIO DE LA TRANSACCIÓN ----
  return prisma.$transaction(async (tx) => {
    // 1. Obtener la venta original
    const venta = await tx.venta.findUnique({
      where: { idVenta },
      include: { detalleVentas: true, credito: true }
    });
    if (!venta) throw new ErrorNoEncontrado(`La venta con ID ${idVenta} no existe.`);

    // 2. Obtener Tipo de Movimiento para Devolución de Cliente
    const tipoMov = await tx.tipoMovimiento.findFirst({
      where: { nombreTipo: 'Devolución de Cliente', activo: true }
    });
    if (!tipoMov) throw new ErrorNoEncontrado('Tipo de movimiento "Devolución de Cliente" no encontrado en el sistema.');

    let subtotalDevolucion = 0;
    
    // 3. Validar los detalles de la devolución
    for (const item of detalleDevoluciones) {
      const detalleVenta = venta.detalleVentas.find(d => d.idDetalleVenta === item.idDetalleVenta);
      if (!detalleVenta) {
        throw new ErrorValidacion(`El detalle de venta con ID ${item.idDetalleVenta} no pertenece a la venta indicada.`);
      }

      // Validar que no se devuelva más de lo que se compró
      const yaDevuelto = await tx.detalleDevolucion.aggregate({
        _sum: { cantidadDevuelta: true },
        where: { idDetalleVenta: item.idDetalleVenta }
      });
      const cantidadYaDevuelta = Number(yaDevuelto._sum.cantidadDevuelta || 0);

      if (Number(item.cantidadDevuelta) > (Number(detalleVenta.cantidad) - cantidadYaDevuelta)) {
        throw new ErrorConflicto(`Intenta devolver ${item.cantidadDevuelta} unidades, pero solo quedan ${Number(detalleVenta.cantidad) - cantidadYaDevuelta} unidades por devolver para el item.`);
      }

      item.precioUnitario = detalleVenta.precioUnitario;
      item.subtotal = Number(item.cantidadDevuelta) * Number(item.precioUnitario);
      subtotalDevolucion += item.subtotal;
      item.idVariante = detalleVenta.idVariante;
    }
    
    const totalDevolucion = subtotalDevolucion;

    // 4. Crear el registro de la devolución
    const numeroDevolucion = `DV-${Date.now()}`;
    const nuevaDevolucion = await tx.devolucion.create({
      data: {
        numeroDevolucion,
        idVenta,
        idUsuario: venta.idUsuario,
        tipoDevolucion: Number(venta.total) === totalDevolucion ? 'total' : 'parcial',
        motivo,
        observaciones,
        subtotalDevolucion,
        totalDevolucion,
        impuestosDevolucion: 0,
        estado: 'procesada', // Se registra como procesada directamente según requerimiento del usuario
        fechaDevolucion: new Date(),
        usuarioRegistro
      }
    });

    // 5. Crear el detalle y registrar movimientos de inventario
    for (const item of detalleDevoluciones) {
      await tx.detalleDevolucion.create({
        data: {
          idDevolucion: nuevaDevolucion.idDevolucion,
          idDetalleVenta: item.idDetalleVenta,
          idVariante: item.idVariante,
          cantidadDevuelta: item.cantidadDevuelta,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal
        }
      });

      // REGISTRAR MOVIMIENTO DE INVENTARIO (Entrada por Devolución)
      await movimientosService.crearMovimiento(tx, {
        idVariante: item.idVariante,
        cantidad: Number(item.cantidadDevuelta), // Entrada es positiva
        idTipoMovimiento: tipoMov.idTipoMovimiento,
        usuarioRegistro,
        motivo: `Devolución de Cliente: ${numeroDevolucion}`,
        idVenta: venta.idVenta
      });
    }

    // 6. Ajustar el saldo de la venta y/o crédito
    const nuevoSaldoVenta = Math.max(0, Number(venta.saldoPendiente) - totalDevolucion);
    await tx.venta.update({
        where: { idVenta: venta.idVenta },
        data: { saldoPendiente: nuevoSaldoVenta }
    });

    if (venta.credito) {
        const nuevoSaldoCredito = Math.max(0, Number(venta.credito.saldoPendiente) - totalDevolucion);
        const nuevoMontoCredito = Math.max(0, Number(venta.credito.montoCredito) - totalDevolucion);
        
        await tx.credito.update({
            where: { idCredito: venta.credito.idCredito },
            data: { 
                saldoPendiente: nuevoSaldoCredito,
                montoCredito: nuevoMontoCredito,
                estado: nuevoSaldoCredito <= 0 ? 'pagado' : venta.credito.estado
            }
        });
    }

    // 7. Devolver la devolución completa
    return tx.devolucion.findUnique({
      where: { idDevolucion: nuevaDevolucion.idDevolucion },
      include: includeRelacionesDevolucion
    });
  }); // ---- FIN DE LA TRANSACCIÓN ----
}


/**
 * Obtiene una lista paginada de devoluciones.
 * @param {object} [filtros={}] - Opciones de filtrado.
 * @param {object} [paginacion] - Opciones de paginación.
 * @returns {Promise<object>} Objeto con lista de devoluciones y paginación.
 */
async function obtenerTodas(filtros = {}, paginacion = { pagina: 1, limite: 10 }) {
  const { idVenta, idUsuario } = filtros;
  const { pagina, limite } = paginacion;
  const skip = (Number(pagina) - 1) * Number(limite);

  const where = {
    AND: [
      idVenta && { idVenta: Number(idVenta) },
      idUsuario && { idUsuario: Number(idUsuario) },
    ].filter(Boolean)
  };

  const [devoluciones, total] = await prisma.$transaction([
    prisma.devolucion.findMany({
      where,
      include: includeRelacionesDevolucion,
      skip,
      take: Number(limite),
      orderBy: { fechaDevolucion: 'desc' }
    }),
    prisma.devolucion.count({ where })
  ]);

  return {
    datos: devoluciones,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      registrosPorPagina: Number(limite),
      totalPaginas: Math.ceil(total / limite)
    }
  };
}

/**
 * Obtiene una devolución por su ID.
 * @param {number} id - El ID de la devolución.
 * @param {object} usuario - El usuario que realiza la solicitud.
 * @returns {Promise<object>} La devolución encontrada.
 */
async function obtenerPorId(id, usuario) {
  const idDevolucion = parseInt(id, 10);
  if (isNaN(idDevolucion)) throw new ErrorValidacion('El ID de devolución debe ser un número.');

  const devolucion = await prisma.devolucion.findUnique({
    where: { idDevolucion },
    include: includeRelacionesDevolucion
  });

  if (!devolucion) {
    throw new ErrorNoEncontrado(`Devolución con ID ${idDevolucion} no encontrada.`);
  }

  // Permitir al cliente ver sus propias devoluciones
  if (usuario.rol.nombreRol === 'Cliente' && devolucion.idUsuario !== usuario.idUsuario) {
    throw new ErrorAutorizacion('No tienes permiso para ver esta devolución.');
  }

  return devolucion;
}

/**
 * Actualiza una devolución existente.
 * @param {number} id - El ID de la devolución a actualizar.
 * @param {object} datos - Los datos a actualizar.
 * @returns {Promise<object>} La devolución actualizada.
 */
async function actualizar(id, datos) {
  const idDevolucion = parseInt(id, 10);
  if (isNaN(idDevolucion)) throw new ErrorValidacion('El ID de devolución debe ser un número.');

  // Verificar que la devolución existe
  const devolucionExistente = await prisma.devolucion.findUnique({
    where: { idDevolucion }
  });

  if (!devolucionExistente) {
    throw new ErrorNoEncontrado(`Devolución con ID ${idDevolucion} no encontrada.`);
  }

  // No permitir actualizar si ya está procesada
  if (devolucionExistente.estado === 'procesada') {
    throw new ErrorConflicto('No se puede modificar una devolución que ya ha sido procesada.');
  }

  const { motivo, observaciones } = datos;

  const devolucionActualizada = await prisma.devolucion.update({
    where: { idDevolucion },
    data: {
      ...(motivo && { motivo }),
      ...(observaciones && { observaciones }),
      actualizadoEn: new Date()
    },
    include: includeRelacionesDevolucion
  });

  return devolucionActualizada;
}

/**
 * Cambia el estado de una devolución con validaciones y efectos secundarios.
 * @param {number} id - El ID de la devolución.
 * @param {string} nuevoEstado - El nuevo estado ('pendiente', 'aprobada', 'rechazada', 'procesada').
 * @param {object} usuario - El usuario que realiza el cambio.
 * @returns {Promise<object>} La devolución actualizada.
 */
async function cambiarEstado(id, nuevoEstado, usuario) {
  const idDevolucion = parseInt(id, 10);
  if (isNaN(idDevolucion)) throw new ErrorValidacion('El ID de devolución debe ser un número.');

  const estadosValidos = ['pendiente', 'aprobada', 'rechazada', 'procesada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new ErrorValidacion(`Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`);
  }

  // Obtener la devolución con sus relaciones
  const devolucion = await prisma.devolucion.findUnique({
    where: { idDevolucion },
    include: {
      venta: { include: { credito: true } },
      detalleDevoluciones: true
    }
  });

  if (!devolucion) {
    throw new ErrorNoEncontrado(`Devolución con ID ${idDevolucion} no encontrada.`);
  }

  // Validar transiciones de estado
  const estadoActual = devolucion.estado;
  
  // Si ya está procesada, no permitir cambios de estado hacia atrás o hacia ella misma
  if (estadoActual === 'procesada') {
    throw new ErrorConflicto('No se puede cambiar el estado de una devolución que ya ha sido procesada.');
  }

  const transicionesValidas = {
    'pendiente': ['aprobada', 'rechazada', 'procesada'],
    'aprobada': ['procesada', 'rechazada'],
    'rechazada': ['pendiente'],
    'procesada': [] // No se puede cambiar el estado una vez procesada
  };

  if (!transicionesValidas[estadoActual].includes(nuevoEstado)) {
    throw new ErrorConflicto(`No se puede cambiar del estado '${estadoActual}' a '${nuevoEstado}'.`);
  }

  // ---- INICIO DE LA TRANSACCIÓN ----
  return prisma.$transaction(async (tx) => {
    let devolucionActualizada;

    if (nuevoEstado === 'procesada' && estadoActual !== 'procesada') {
      // 1. Obtener Tipo de Movimiento
      const tipoMov = await tx.tipoMovimiento.findFirst({
        where: { nombreTipo: 'Devolución de Cliente', activo: true }
      });
      if (!tipoMov) throw new ErrorNoEncontrado('Tipo de movimiento "Devolución de Cliente" no encontrado.');

      // 2. Procesar variantes y registrar movimientos
      for (const detalle of devolucion.detalleDevoluciones) {
        await movimientosService.crearMovimiento(tx, {
          idVariante: detalle.idVariante,
          cantidad: Number(detalle.cantidadDevuelta),
          idTipoMovimiento: tipoMov.idTipoMovimiento,
          usuarioRegistro: usuario.idUsuario,
          motivo: `Procesamiento de Devolución: ${devolucion.numeroDevolucion}`,
          idVenta: devolucion.idVenta
        });
      }

      // 3. Ajustar el saldo de la venta
      const nuevoSaldoVenta = Math.max(0, Number(devolucion.venta.saldoPendiente) - Number(devolucion.totalDevolucion));
      await tx.venta.update({
        where: { idVenta: devolucion.idVenta },
        data: { saldoPendiente: nuevoSaldoVenta }
      });

      // 4. Ajustar el crédito si existe
      if (devolucion.venta.credito) {
        const credito = devolucion.venta.credito;
        const nuevoSaldoCredito = Math.max(0, Number(credito.saldoPendiente) - Number(devolucion.totalDevolucion));
        const nuevoMontoCredito = Math.max(0, Number(credito.montoCredito) - Number(devolucion.totalDevolucion));
        
        await tx.credito.update({
          where: { idCredito: credito.idCredito },
          data: {
            saldoPendiente: nuevoSaldoCredito,
            montoCredito: nuevoMontoCredito,
            estado: nuevoSaldoCredito <= 0 ? 'pagado' : credito.estado
          }
        });
      }
    }

    // Actualizar el estado de la devolución
    devolucionActualizada = await tx.devolucion.update({
      where: { idDevolucion },
      data: {
        estado: nuevoEstado,
        actualizadoEn: new Date()
      },
      include: includeRelacionesDevolucion
    });

    return devolucionActualizada;
  });
}

/**
 * Elimina una devolución (baja lógica).
 * Solo se pueden eliminar devoluciones en estado 'pendiente' o 'rechazada'.
 * @param {number} id - El ID de la devolución a eliminar.
 * @param {object} usuario - El usuario que realiza la eliminación.
 * @returns {Promise<void>}
 */
async function eliminar(id, usuario) {
  const idDevolucion = parseInt(id, 10);
  if (isNaN(idDevolucion)) throw new ErrorValidacion('El ID de devolución debe ser un número.');

  const devolucion = await prisma.devolucion.findUnique({
    where: { idDevolucion }
  });

  if (!devolucion) {
    throw new ErrorNoEncontrado(`Devolución con ID ${idDevolucion} no encontrada.`);
  }

  // Solo permitir eliminar devoluciones no procesadas
  if (devolucion.estado === 'procesada') {
    throw new ErrorConflicto('No se puede eliminar una devolución que ya ha sido procesada.');
  }

  // Eliminar la devolución (Prisma eliminará en cascada los detalles)
  await prisma.devolucion.delete({
    where: { idDevolucion }
  });
}

// --- EXPORTACIÓN ---
module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  actualizar,
  cambiarEstado,
  eliminar
};
