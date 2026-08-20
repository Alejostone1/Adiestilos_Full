/**
 * Servicio para la lógica de negocio de Estados de Pedido.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const { ErrorNoEncontrado, ErrorValidacion } = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

async function obtenerTodos() {
  return prisma.estadoPedido.findMany({
    where: { activo: true },
    orderBy: { orden: 'asc' }
  });
}

async function crear(datos) {
  const { nombreEstado } = datos;
  if (!nombreEstado) throw new ErrorValidacion('El nombre del estado es requerido.');

  return prisma.estadoPedido.create({ data: datos });
}

async function actualizar(id, datos) {
  const idEstado = parseInt(id, 10);
  if (isNaN(idEstado)) throw new ErrorValidacion('El ID debe ser un número.');

  await prisma.estadoPedido.findFirstOrThrow({ where: { idEstadoPedido: idEstado } })
    .catch(() => { throw new ErrorNoEncontrado(`Estado de pedido con ID ${id} no encontrado.`); });

  return prisma.estadoPedido.update({
    where: { idEstadoPedido: idEstado },
    data: datos
  });
}


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodos,
  crear,
  actualizar
};
