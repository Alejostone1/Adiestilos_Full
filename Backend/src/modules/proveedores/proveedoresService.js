/**
 * Servicio para la lógica de negocio de Proveedores.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const { ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene una lista paginada de proveedores.
 * @param {object} [filtros={}] - Opciones de filtrado (nombre, nit, estado).
 * @param {object} [paginacion={ pagina: 1, limite: 10 }] - Opciones de paginación.
 * @returns {Promise<object>} Lista de proveedores y metadatos de paginación.
 */
async function obtenerTodos(filtros = {}, { pagina = 1, limite = 10 }) {
  const { nombre, nit, estado } = filtros;

  const skip = (Number(pagina) - 1) * Number(limite);

  const where = {
    AND: [
      nombre && { nombreProveedor: { contains: nombre, mode: 'insensitive' } },
      nit && { nitCC: { contains: nit, mode: 'insensitive' } },
      estado && { estado: { equals: estado, mode: 'insensitive' } }
    ].filter(Boolean)
  };

  const [proveedores, total] = await prisma.$transaction([
    prisma.proveedor.findMany({
      where,
      include: {
        _count: {
          select: { productos: true, compras: true }
        }
      },
      skip,
      take: Number(limite),
      orderBy: { nombreProveedor: 'asc' }
    }),
    prisma.proveedor.count({ where })
  ]);

  return {
    datos: proveedores,
    paginacion: {
      totalRegistros: total,
      paginaActual: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      registrosPorPagina: Number(limite)
    }
  };
}

/**
 * Obtiene un proveedor específico por su ID.
 * @param {number} id - El ID del proveedor.
 * @returns {Promise<object>} El proveedor encontrado.
 */
async function obtenerPorId(id) {
  const idProveedor = parseInt(id, 10);
  if (isNaN(idProveedor)) {
    throw new ErrorValidacion('El ID del proveedor debe ser un número.');
  }

  const proveedor = await prisma.proveedor.findUnique({
    where: { idProveedor },
    include: {
      productos: { take: 10, orderBy: { creadoEn: 'desc' } },
      compras: { take: 10, orderBy: { fechaCompra: 'desc' } },
       _count: {
          select: { productos: true, compras: true }
        }
    }
  });

  if (!proveedor) {
    throw new ErrorNoEncontrado(`Proveedor con ID ${idProveedor} no encontrado.`);
  }
  return proveedor;
}

/**
 * Crea un nuevo proveedor.
 * @param {object} datos - Datos del nuevo proveedor.
 * @returns {Promise<object>} El proveedor creado.
 */
async function crear(datos) {
  const { nombreProveedor, nitCC, ...restoDatos } = datos;

  if (!nombreProveedor || !nitCC) {
    throw new ErrorValidacion('Nombre y NIT/CC son obligatorios.');
  }

  // Verificar que el NIT/CC sea único
  const existente = await prisma.proveedor.findUnique({ where: { nitCC } });
  if (existente) {
    throw new ErrorConflicto(`El NIT/CC '${nitCC}' ya está registrado.`);
  }

  return prisma.proveedor.create({
    data: { nombreProveedor, nitCC, ...restoDatos }
  });
}

/**
 * Actualiza un proveedor existente.
 * @param {number} id - El ID del proveedor a actualizar.
 * @param {object} datos - Los datos a actualizar.
 * @returns {Promise<object>} El proveedor actualizado.
 */
async function actualizar(id, datos) {
  const idProveedor = parseInt(id, 10);
  if (isNaN(idProveedor)) throw new ErrorValidacion('El ID del proveedor debe ser un número.');

  await obtenerPorId(idProveedor); // Asegura que el proveedor exista

  const { nitCC, ...restoDatos } = datos;

  if (nitCC) {
    const conflicto = await prisma.proveedor.findFirst({
      where: {
        nitCC,
        idProveedor: { not: idProveedor }
      }
    });
    if (conflicto) {
      throw new ErrorConflicto(`El NIT/CC '${nitCC}' ya pertenece a otro proveedor.`);
    }
  }

  return prisma.proveedor.update({
    where: { idProveedor },
    data: { nitCC, ...restoDatos }
  });
}

/**
 * Cambia el estado de un proveedor a 'inactivo' (borrado lógico).
 * @param {number} id - El ID del proveedor.
 * @returns {Promise<object>} El proveedor actualizado.
 */
async function desactivar(id) {
  const idProveedor = parseInt(id, 10);
  if (isNaN(idProveedor)) throw new ErrorValidacion('El ID del proveedor debe ser un número.');

  await obtenerPorId(idProveedor);

  // Lógica adicional: se podría impedir desactivar si hay compras pendientes.
  // const comprasPendientes = await prisma.compra.count({
  //   where: { idProveedor, estado: 'pendiente' }
  // });
  // if (comprasPendientes > 0) {
  //   throw new ErrorConflicto(`No se puede desactivar el proveedor porque tiene ${comprasPendientes} compras pendientes.`);
  // }

  return prisma.proveedor.update({
    where: { idProveedor },
    data: { estado: 'inactivo' }
  });
}

// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  desactivar
};
