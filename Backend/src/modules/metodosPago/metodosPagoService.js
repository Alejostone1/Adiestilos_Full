/**
 * Servicio para la lógica de negocio de Métodos de Pago.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const { ErrorNoEncontrado, ErrorValidacion } = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

async function obtenerTodos() {
  return prisma.metodoPago.findMany({
    where: { activo: true },
    include: {
      tipoMetodo: true
    },
    orderBy: { nombreMetodo: 'asc' }
  });
}

async function obtenerTipos() {
  return prisma.tipoMetodoPago.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });
}

async function crear(datos) {
  const { nombreMetodo, idTipoMetodo } = datos;
  if (!nombreMetodo) throw new ErrorValidacion('El nombre del método de pago es requerido.');
  if (!idTipoMetodo) throw new ErrorValidacion('El tipo de método de pago es requerido.');

  return prisma.metodoPago.create({ 
    data: {
      ...datos,
      idTipoMetodo: parseInt(idTipoMetodo, 10)
    },
    include: { tipoMetodo: true }
  });
}

async function actualizar(id, datos) {
  const idMetodo = parseInt(id, 10);
  if (isNaN(idMetodo)) throw new ErrorValidacion('El ID debe ser un número.');

  await prisma.metodoPago.findFirstOrThrow({ where: { idMetodoPago: idMetodo } })
    .catch(() => { throw new ErrorNoEncontrado(`Método de pago con ID ${id} no encontrado.`); });

  return prisma.metodoPago.update({
    where: { idMetodoPago: idMetodo },
    data: {
      ...datos,
      idTipoMetodo: datos.idTipoMetodo ? parseInt(datos.idTipoMetodo, 10) : undefined
    },
    include: { tipoMetodo: true }
  });
}

async function obtenerPorId(id) {
  const idMetodo = parseInt(id, 10);
  if (isNaN(idMetodo)) throw new ErrorValidacion('El ID debe ser un número.');

  const metodo = await prisma.metodoPago.findUnique({ 
    where: { idMetodoPago: idMetodo },
    include: { tipoMetodo: true }
  });
  if (!metodo) throw new ErrorNoEncontrado(`Método de pago con ID ${id} no encontrado.`);
  return metodo;
}

async function eliminar(id) {
  const idMetodo = parseInt(id, 10);
  if (isNaN(idMetodo)) throw new ErrorValidacion('El ID debe ser un número.');

  return prisma.metodoPago.update({
    where: { idMetodoPago: idMetodo },
    data: { activo: false } // Eliminación lógica
  });
}


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodos,
  obtenerTipos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
