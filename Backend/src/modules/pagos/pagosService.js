/**
 * Servicio para la lógica de negocio de Pagos.
 * Maneja la consulta de información de pagos. La creación de pagos
 * se gestiona en los servicios de Ventas y Créditos para asegurar la atomicidad.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const {
  ErrorNoEncontrado,
  ErrorValidacion,
  ErrorAutorizacion
} = require('../../utils/errorHelper');

// --- OBJETOS DE INCLUSIÓN REUTILIZABLES ---

const includeRelacionesPago = {
  metodoPago: true,
  usuarioRegistroRef: {
    select: {
      idUsuario: true,
      nombres: true,
      apellidos: true
    }
  },
  venta: {
    select: {
      idVenta: true,
      numeroFactura: true,
      idUsuario: true // Necesario para la validación de permisos
    }
  }
};

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene todos los pagos asociados a una venta específica.
 * @param {number} idVenta - El ID de la venta.
 * @param {object} usuario - El usuario que realiza la solicitud.
 * @returns {Promise<Array<object>>} Una lista de los pagos de la venta.
 */
async function obtenerPorVenta(idVenta, usuario) {
  const idVentaNum = parseInt(idVenta, 10);
  if (isNaN(idVentaNum)) throw new ErrorValidacion('El ID de la venta debe ser un número.');

  // Primero, verificar si la venta existe y si el usuario tiene permiso para verla.
  const venta = await prisma.venta.findUnique({ where: { idVenta: idVentaNum } });
  if (!venta) {
    throw new ErrorNoEncontrado(`La venta con ID ${idVentaNum} no existe.`);
  }

  if (usuario.rol.nombreRol === 'Cliente' && venta.idUsuario !== usuario.idUsuario) {
    throw new ErrorAutorizacion('No tienes permiso para ver los pagos de esta venta.');
  }

  const pagos = await prisma.pago.findMany({
    where: { idVenta: idVentaNum },
    include: includeRelacionesPago,
    orderBy: { fechaPago: 'asc' }
  });

  return pagos;
}

/**
 * Obtiene un pago específico por su ID.
 * @param {number} id - El ID del pago.
 * @param {object} usuario - El usuario que realiza la solicitud.
 * @returns {Promise<object>} El objeto del pago.
 */
async function obtenerPorId(id, usuario) {
  const idPago = parseInt(id, 10);
  if (isNaN(idPago)) throw new ErrorValidacion('El ID del pago debe ser un número.');

  const pago = await prisma.pago.findUnique({
    where: { idPago },
    include: includeRelacionesPago
  });

  if (!pago) {
    throw new ErrorNoEncontrado(`Pago con ID ${idPago} no encontrado.`);
  }

  // Si el usuario es un cliente, verificar que sea el dueño de la venta asociada al pago.
  if (usuario.rol.nombreRol === 'Cliente' && pago.venta.idUsuario !== usuario.idUsuario) {
    throw new ErrorAutorizacion('No tienes permiso para acceder a este pago.');
  }

  return pago;
}


// --- EXPORTACIÓN ---
module.exports = {
  obtenerPorVenta,
  obtenerPorId
};
