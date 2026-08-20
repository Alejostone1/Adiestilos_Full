/**
 * Servicio para la lógica de negocio de Tipos de Movimiento.
 */

const { prisma } = require('../../config/databaseConfig');
const { ErrorNoEncontrado, ErrorValidacion } = require('../../utils/errorHelper');

/**
 * Crea un nuevo tipo de movimiento.
 * @param {object} datos - Datos para crear el tipo de movimiento.
 * @returns {Promise<object>} El nuevo tipo de movimiento creado.
 */
async function crearTipoMovimiento(datos) {
  const { nombreTipo, tipo, afectaCosto, descripcion } = datos;

  if (!nombreTipo || !tipo) {
    throw new ErrorValidacion('El nombre del tipo y el tipo (entrada/salida/ajuste) son obligatorios.');
  }

  return prisma.tipoMovimiento.create({
    data: {
      nombreTipo,
      tipo,
      afectaCosto,
      descripcion,
      activo: true
    }
  });
}

/**
 * Obtiene todos los tipos de movimiento con paginación y filtros.
 * @param {object} [paginacion] - Opciones de paginación.
 * @returns {Promise<object>} Lista de tipos de movimiento y datos de paginación.
 */
async function obtenerTodosLosTiposMovimiento(paginacion = { pagina: 1, limite: 10 }) {
    const { pagina, limite } = paginacion;
    const skip = (Number(pagina) - 1) * Number(limite);

    const [tipos, total] = await prisma.$transaction([
        prisma.tipoMovimiento.findMany({
            skip,
            take: Number(limite),
            orderBy: { nombreTipo: 'asc' }
        }),
        prisma.tipoMovimiento.count()
    ]);

    return {
        datos: tipos,
        paginacion: {
            totalRegistros: total,
            paginaActual: Number(pagina),
            totalPaginas: Math.ceil(total / limite),
        }
    };
}

/**
 * Obtiene un tipo de movimiento por su ID.
 * @param {number} id - El ID del tipo de movimiento.
 * @returns {Promise<object>} El tipo de movimiento encontrado.
 */
async function obtenerTipoMovimientoPorId(id) {
  const tipoMovimiento = await prisma.tipoMovimiento.findUnique({
    where: { idTipoMovimiento: id }
  });

  if (!tipoMovimiento) {
    throw new ErrorNoEncontrado(`No se encontró el tipo de movimiento con ID ${id}.`);
  }

  return tipoMovimiento;
}

/**
 * Actualiza un tipo de movimiento existente.
 * @param {number} id - El ID del tipo de movimiento a actualizar.
 * @param {object} datos - Los datos a actualizar.
 * @returns {Promise<object>} El tipo de movimiento actualizado.
 */
async function actualizarTipoMovimiento(id, datos) {
  const { nombreTipo, tipo, afectaCosto, descripcion, activo } = datos;

  // Verifica que el tipo de movimiento exista
  await obtenerTipoMovimientoPorId(id);

  return prisma.tipoMovimiento.update({
    where: { idTipoMovimiento: id },
    data: {
      nombreTipo,
      tipo,
      afectaCosto,
      descripcion,
      activo
    }
  });
}

/**
 * Desactiva (borrado lógico) un tipo de movimiento.
 * @param {number} id - El ID del tipo de movimiento a desactivar.
 * @returns {Promise<object>} El tipo de movimiento actualizado.
 */
async function desactivarTipoMovimiento(id) {
    // No se permite borrar tipos de movimiento, solo desactivarlos.
    // Esto mantiene la integridad referencial para movimientos históricos.
    const tipoMovimiento = await obtenerTipoMovimientoPorId(id);
    if (!tipoMovimiento.activo) {
        throw new ErrorValidacion('Este tipo de movimiento ya está inactivo.');
    }

    return prisma.tipoMovimiento.update({
        where: { idTipoMovimiento: id },
        data: { activo: false }
    });
}


module.exports = {
  crearTipoMovimiento,
  obtenerTodosLosTiposMovimiento,
  obtenerTipoMovimientoPorId,
  actualizarTipoMovimiento,
  desactivarTipoMovimiento,
};
