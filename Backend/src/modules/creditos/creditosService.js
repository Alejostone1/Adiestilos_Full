/**
 * Servicio para la lógica de negocio de Créditos.
 * Maneja la consulta de créditos y el registro de abonos a los mismos.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const {
  ErrorNoEncontrado,
  ErrorValidacion,
  ErrorConflicto,
  ErrorAutorizacion
} = require('../../utils/errorHelper');

// --- OBJETOS DE INCLUSIÓN REUTILIZABLES ---

const includeRelacionesCredito = {
  usuarioCliente: { 
    select: { 
      idUsuario: true, 
      nombres: true, 
      apellidos: true,
      correoElectronico: true,
      telefono: true,
      direccion: true,
      usuario: true
    } 
  },
  venta: {
    select: {
      idVenta: true,
      numeroFactura: true,
      creadoEn: true,
      total: true
    }
  }
};

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene una lista paginada de créditos con filtros.
 * @param {object} [filtros={}] - Opciones de filtrado (estado, idUsuario).
 * @param {object} [paginacion={ pagina: 1, limite: 10 }] - Opciones de paginación.
 * @returns {Promise<object>} Objeto con la lista de créditos y metadatos de paginación.
 */
async function obtenerTodos(filtros = {}, paginacion = { pagina: 1, limite: 10 }) {
  const { estado, idUsuario } = filtros;
  const { pagina, limite } = paginacion;

  const skip = (Number(pagina) - 1) * Number(limite);

  const where = {
    AND: [
      estado && { estado: { equals: estado } },
      idUsuario && { idUsuario: Number(idUsuario) }
    ].filter(Boolean)
  };

  const [creditos, total] = await prisma.$transaction([
    prisma.credito.findMany({
      where,
      include: includeRelacionesCredito,
      skip,
      take: Number(limite),
      orderBy: { fechaInicio: 'desc' }
    }),
    prisma.credito.count({ where })
  ]);

  return {
    datos: creditos,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene un crédito específico por su ID.
 * @param {number} id - El ID del crédito.
 * @param {object} usuario - El usuario que realiza la solicitud.
 * @returns {Promise<object>} El objeto del crédito.
 */
async function obtenerPorId(id, usuario) {
  const idCredito = parseInt(id, 10);
  if (isNaN(idCredito)) throw new ErrorValidacion('El ID del crédito debe ser un número.');

  const credito = await prisma.credito.findUnique({
    where: { idCredito },
    include: {
        ...includeRelacionesCredito,
        venta: {
            include: {
                pagos: {
                    include: { metodoPago: true },
                    orderBy: { fechaPago: 'asc' }
                },
                detalleVentas: {
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
                        }
                    }
                }
            }
        }
    }
  });

  if (!credito) {
    throw new ErrorNoEncontrado(`Crédito con ID ${idCredito} no encontrado.`);
  }

  // Si el usuario es un cliente, verificar que sea el dueño del crédito
  if (usuario.rol.nombreRol === 'Cliente' && credito.idUsuario !== usuario.idUsuario) {
    throw new ErrorAutorizacion('No tienes permiso para acceder a este crédito.');
  }

  return credito;
}

/**
 * Obtiene todos los créditos de un cliente específico.
 * @param {number} idUsuario - El ID del usuario (cliente).
 * @param {object} usuarioSolicitante - El usuario que realiza la solicitud.
 * @returns {Promise<Array<object>>} Una lista de los créditos del cliente.
 */
async function obtenerPorCliente(idUsuario, usuarioSolicitante) {
    const idCliente = parseInt(idUsuario, 10);
    if (isNaN(idCliente)) throw new ErrorValidacion('El ID de usuario debe ser un número.');

    // Un usuario solo puede ver sus propios créditos, a menos que sea admin/vendedor/cajero
    const rolesPermitidos = ['Administrador', 'Vendedor', 'Cajero'];
    if (usuarioSolicitante.rol.nombreRol === 'Cliente' && usuarioSolicitante.idUsuario !== idCliente) {
        throw new ErrorAutorizacion('No tienes permiso para ver los créditos de otro cliente.');
    }
    if(!rolesPermitidos.includes(usuarioSolicitante.rol.nombreRol) && usuarioSolicitante.idUsuario !== idCliente) {
        throw new ErrorAutorizacion('No tienes permiso para realizar esta acción.');
    }

    const creditos = await prisma.credito.findMany({
        where: { idUsuario: idCliente },
        include: includeRelacionesCredito,
        orderBy: { estado: 'asc', fechaVencimiento: 'asc' }
    });

    if (creditos.length === 0) {
        // No es un error, es para informar que no se encontraron créditos.
        return [];
    }

    return creditos;
}

/**
 * Agrega un abono a un crédito existente de forma transaccional.
 * Soporta múltiples formas de pago para un mismo abono.
 * @param {number} idCredito - El ID del crédito.
 * @param {object} datosAbono - Datos del abono ({ pagos, notas, usuarioRegistro }).
 * @returns {Promise<object>} El crédito actualizado.
 */
async function agregarAbono(idCredito, datosAbono) {
  const { pagos, notas, usuarioRegistro, monto, idMetodoPago, referencia } = datosAbono;
  const idCred = parseInt(idCredito, 10);

  // Normalizar pagos: si viene el formato anterior (monto, idMetodoPago), convertir a array
  let listaPagos = pagos;
  if (!listaPagos && monto && idMetodoPago) {
    listaPagos = [{ monto, idMetodoPago, referencia }];
  }

  if (!listaPagos || listaPagos.length === 0 || !usuarioRegistro) {
    throw new ErrorValidacion('Faltan datos requeridos para registrar el abono (pagos, usuario).');
  }

  const montoTotalAbono = listaPagos.reduce((sum, p) => sum + Number(p.monto || 0), 0);

  if (montoTotalAbono <= 0) {
    throw new ErrorValidacion('El monto total del abono debe ser mayor a cero.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Obtener el crédito y bloquearlo
    const credito = await tx.credito.findUnique({
      where: { idCredito: idCred },
      include: { venta: true }
    });

    if (!credito) {
      throw new ErrorNoEncontrado(`Crédito con ID ${idCred} no encontrado.`);
    }
    if (credito.estado === 'pagado') {
      throw new ErrorConflicto('Este crédito ya ha sido liquidado completamente.');
    }
    if (montoTotalAbono > credito.saldoPendiente) {
      throw new ErrorValidacion(`El monto total del abono (${montoTotalAbono}) no puede ser mayor al saldo pendiente (${credito.saldoPendiente}).`);
    }

    // 2. Registrar cada pago individualmente
    let saldoActualVenta = Number(credito.venta.saldoPendiente);
    
    for (const pago of listaPagos) {
      const pMonto = Number(pago.monto);
      const saldoNuevoPago = saldoActualVenta - pMonto;
      
      await tx.pago.create({
        data: {
          idVenta: credito.idVenta,
          monto: pMonto,
          idMetodoPago: Number(pago.idMetodoPago),
          usuarioRegistro,
          tipoPago: 'abono',
          saldoAnterior: saldoActualVenta,
          saldoNuevo: saldoNuevoPago,
          referencia: pago.referencia || null,
          notas: notas || null,
          fechaPago: new Date()
        }
      });
      
      saldoActualVenta = saldoNuevoPago;
    }
    
    // 3. Actualizar la Venta
    await tx.venta.update({
        where: { idVenta: credito.idVenta },
        data: {
            totalPagado: { increment: montoTotalAbono },
            saldoPendiente: { decrement: montoTotalAbono },
            estadoPago: saldoActualVenta <= 0 ? 'pagado' : 'parcial'
        }
    });

    // 4. Actualizar el crédito
    const nuevoSaldoCredito = credito.saldoPendiente - montoTotalAbono;
    const nuevoEstadoCredito = nuevoSaldoCredito <= 0 ? 'pagado' : 'activo';

    const creditoActualizado = await tx.credito.update({
      where: { idCredito: idCred },
      data: {
        totalAbonado: { increment: montoTotalAbono },
        saldoPendiente: { decrement: montoTotalAbono },
        estado: nuevoEstadoCredito,
        fechaUltimoPago: new Date(),
        observaciones: notas ? (credito.observaciones ? `${credito.observaciones}\n${notas}` : notas) : credito.observaciones
      }
    });

    return creditoActualizado;
  });
}

// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorCliente,
  agregarAbono
};
