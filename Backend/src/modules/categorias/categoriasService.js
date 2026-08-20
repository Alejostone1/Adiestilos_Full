/**
 * Servicio para la lógica de negocio de Categorías.
 */

// --- IMPORTACIONES ---
const { prisma } = require('../../config/databaseConfig');
const { ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require('../../utils/errorHelper');

// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene todas las categorías, con opción a formato de árbol.
 * @param {object} [options={}] - Opciones para la consulta.
 * @param {boolean} [options.jerarquia=false] - Si es true, devuelve las categorías en una estructura jerárquica.
 * @returns {Promise<Array<object>>} Una lista de categorías.
 */
async function obtenerTodas(options = {}) {
  const { jerarquia = false } = options;

  const include = {
    _count: {
      select: { productos: true }
    }
  };

  if (!jerarquia) {
    // Devuelve una lista plana de todas las categorías
    return prisma.categoria.findMany({
      include,
      orderBy: { nombreCategoria: 'asc' }
    });
  }

  // Devuelve una estructura de árbol con subcategorías anidadas
  const categorias = await prisma.categoria.findMany({
    where: { categoriaPadre: null }, // Empezar desde las categorías raíz
    include: {
      ...include,
      subcategorias: {
        include: {
          ...include,
          subcategorias: { // Segundo nivel de anidación
             include
          }
        }
      }
    },
    orderBy: { nombreCategoria: 'asc' }
  });
  return categorias;
}

/**
 * Obtiene una categoría específica por su ID.
 * @param {number} id - El ID de la categoría.
 * @returns {Promise<object>} La categoría encontrada.
 */
async function obtenerPorId(id) {
  const idCategoria = parseInt(id, 10);
  if (isNaN(idCategoria)) {
    throw new ErrorValidacion('El ID de la categoría debe ser un número.');
  }

  const categoria = await prisma.categoria.findUnique({
    where: { idCategoria },
    include: {
      productos: { take: 10, orderBy: { creadoEn: 'desc' } }, // Muestra los 10 productos más recientes
      subcategorias: true,
      categoriaPadreRef: true,
      _count: {
        select: { productos: true }
      }
    }
  });

  if (!categoria) {
    throw new ErrorNoEncontrado(`Categoría con ID ${idCategoria} no encontrada.`);
  }
  return categoria;
}

/**
 * Crea una nueva categoría.
 * @param {object} datos - Datos de la nueva categoría.
 * @returns {Promise<object>} La categoría creada.
 */
async function crear(datos) {
  const { nombreCategoria, descripcion, imagenCategoria, categoriaPadre, estado } = datos;

  if (!nombreCategoria) {
    throw new ErrorValidacion('El nombre de la categoría es obligatorio.');
  }

  // Verificar que el nombre sea único
  const existente = await prisma.categoria.findUnique({
    where: { nombreCategoria }
  });
  if (existente) {
    throw new ErrorConflicto(`La categoría '${nombreCategoria}' ya existe.`);
  }

  // Si se proporciona una categoría padre, verificar que exista
  if (categoriaPadre) {
    const padre = await prisma.categoria.findUnique({ where: { idCategoria: Number(categoriaPadre) } });
    if (!padre) {
      throw new ErrorValidacion(`La categoría padre con ID ${categoriaPadre} no existe.`);
    }
  }

  return prisma.categoria.create({
    data: {
      nombreCategoria,
      descripcion,
      imagenCategoria,
      estado,
      categoriaPadre: categoriaPadre ? Number(categoriaPadre) : null,
    }
  });
}

/**
 * Actualiza una categoría existente.
 * @param {number} id - El ID de la categoría a actualizar.
 * @param {object} datos - Los datos a actualizar.
 * @returns {Promise<object>} La categoría actualizada.
 */
async function actualizar(id, datos) {
  const idCategoria = parseInt(id, 10);
  if (isNaN(idCategoria)) throw new ErrorValidacion('El ID de la categoría debe ser un número.');

  await obtenerPorId(idCategoria); // Asegura que la categoría exista

  const { nombreCategoria, ...restoDatos } = datos;

  if (nombreCategoria) {
    const conflicto = await prisma.categoria.findFirst({
      where: {
        nombreCategoria,
        idCategoria: { not: idCategoria }
      }
    });
    if (conflicto) {
      throw new ErrorConflicto(`El nombre de categoría '${nombreCategoria}' ya está en uso.`);
    }
  }

  return prisma.categoria.update({
    where: { idCategoria },
    data: { nombreCategoria, ...restoDatos }
  });
}

/**
 * Elimina una categoría si no tiene productos asociados.
 * @param {number} id - El ID de la categoría a eliminar.
 * @returns {Promise<object>} Un mensaje de confirmación.
 */
async function eliminar(id) {
  const idCategoria = parseInt(id, 10);
  if (isNaN(idCategoria)) throw new ErrorValidacion('El ID de la categoría debe ser un número.');

  const categoria = await obtenerPorId(idCategoria);

  if (categoria._count.productos > 0) {
    throw new ErrorConflicto(`No se puede eliminar la categoría '${categoria.nombreCategoria}' porque tiene ${categoria._count.productos} productos asociados.`);
  }
  
  // Opcional: Validar si tiene subcategorías
  const tieneSubcategorias = await prisma.categoria.count({ where: { categoriaPadre: idCategoria }});
  if(tieneSubcategorias > 0) {
      throw new ErrorConflicto(`No se puede eliminar la categoría porque tiene subcategorías. Primero elimine o reasigne las subcategorías.`);
  }

  await prisma.categoria.delete({
    where: { idCategoria }
  });

  return { mensaje: `Categoría '${categoria.nombreCategoria}' eliminada exitosamente.` };
}

// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
