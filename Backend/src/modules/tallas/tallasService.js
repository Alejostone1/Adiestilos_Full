
/**
 * @file tallasService.js
 * @brief Servicio para la lógica de negocio relacionada con las tallas.
 *
 * Este archivo se encarga de las operaciones de la base de datos para el modelo Talla,
 * utilizando Prisma para interactuar con la tabla de tallas. Proporciona una
 * capa de abstracción entre el controlador y la base de datos.
 */

// Importación de la instancia de Prisma
const { prisma } = require('../../config/databaseConfig');

/**
 * @function obtenerTodasLasTallas
 * @brief Recupera todas las tallas de la base de datos.
 * @returns {Promise<Array>} Una lista de todos los registros de tallas.
 * @description Consulta la base de datos para obtener todas las tallas,
 * ordenadas por `idTalla` en orden descendente.
 */
const obtenerTodasLasTallas = async () => {
  return prisma.talla.findMany({
    orderBy: {
      idTalla: 'desc',
    },
  });
};

/**
 * @function obtenerTallaPorId
 * @brief Busca una talla específica por su ID.
 * @param {number} id - El ID de la talla a buscar.
 * @returns {Promise<object|null>} El objeto de la talla si se encuentra, de lo contrario null.
 * @description Realiza una búsqueda en la base de datos para encontrar una talla
 * que coincida con el ID proporcionado.
 */
const obtenerTallaPorId = async (id) => {
  return prisma.talla.findUnique({
    where: {
      idTalla: id,
    },
  });
};

/**
 * @function crearTalla
 * @brief Crea un nuevo registro de talla.
 * @param {object} datosTalla - Un objeto que contiene los datos de la nueva talla
 * (ej. nombreTalla, tipoTalla).
 * @returns {Promise<object>} El objeto de la talla recién creada.
 * @description Inserta una nueva talla en la base de datos con los datos proporcionados.
 */
const crearTalla = async (datosTalla) => {
  return prisma.talla.create({
    data: datosTalla,
  });
};

/**
 * @function actualizarTalla
 * @brief Actualiza una talla existente.
 * @param {number} id - El ID de la talla a actualizar.
 * @param {object} datosActualizacion - Un objeto con los campos a actualizar.
 * @returns {Promise<object>} El objeto de la talla actualizada.
 * @description Modifica una talla existente, identificada por su ID, con los
 * nuevos datos proporcionados.
 */
const actualizarTalla = async (id, datosActualizacion) => {
  return prisma.talla.update({
    where: {
      idTalla: id,
    },
    data: datosActualizacion,
  });
};

/**
 * @function eliminarTalla
 * @brief Desactiva una talla (borrado lógico).
 * @param {number} id - El ID de la talla a desactivar.
 * @returns {Promise<object>} El objeto de la talla con su nuevo estado 'inactivo'.
 * @description Realiza un "soft delete" cambiando el campo `estado` de la talla a 'inactivo'
 * para preservar la integridad de los datos históricos.
 */
const eliminarTalla = async (id) => {
  return prisma.talla.update({
    where: {
      idTalla: id,
    },
    data: {
      estado: 'inactivo',
    },
  });
};

// Exportar las funciones para su uso en el controlador
module.exports = {
  obtenerTodasLasTallas,
  obtenerTallaPorId,
  crearTalla,
  actualizarTalla,
  eliminarTalla,
};
