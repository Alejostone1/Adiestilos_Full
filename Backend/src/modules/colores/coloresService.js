
/**
 * @file coloresService.js
 * @brief Servicio para la lógica de negocio relacionada con los colores.
 *
 * Este archivo contiene funciones que interactúan con la base de datos
 * para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * sobre el modelo de Color. Utiliza el cliente de Prisma para las consultas.
 */

// Importación del cliente de Prisma para la interacción con la base de datos
const { prisma } = require('../../config/databaseConfig');

/**
 * @function obtenerTodosLosColores
 * @brief Obtiene todos los colores de la base de datos.
 * @returns {Promise<Array>} Un arreglo con todos los colores.
 * @description Realiza una consulta a la base de datos para obtener una lista de todos los colores,
 * ordenados por `idColor` de forma descendente.
 */
const obtenerTodosLosColores = async () => {
  return prisma.color.findMany({
    orderBy: {
      idColor: 'desc',
    },
  });
};

/**
 * @function obtenerColorPorId
 * @brief Obtiene un color específico por su ID.
 * @param {number} id - El ID del color a buscar.
 * @returns {Promise<object|null>} El objeto del color si se encuentra, o null si no.
 * @description Busca en la base de datos un color que coincida con el ID proporcionado.
 */
const obtenerColorPorId = async (id) => {
  return prisma.color.findUnique({
    where: {
      idColor: id,
    },
  });
};

/**
 * @function crearColor
 * @brief Crea un nuevo color en la base de datos.
 * @param {object} datosColor - Objeto con los datos del nuevo color (nombreColor, codigoHex).
 * @returns {Promise<object>} El objeto del color recién creado.
 * @description Inserta un nuevo registro de color en la base de datos con la información proporcionada.
 */
const crearColor = async (datosColor) => {
  return prisma.color.create({
    data: datosColor,
  });
};

/**
 * @function actualizarColor
 * @brief Actualiza un color existente en la base de datos.
 * @param {number} id - El ID del color a actualizar.
 * @param {object} datosActualizacion - Objeto con los nuevos datos para el color.
 * @returns {Promise<object>} El objeto del color actualizado.
 * @description Modifica un registro de color existente, identificado por su ID,
 * con los nuevos datos proporcionados.
 */
const actualizarColor = async (id, datosActualizacion) => {
  return prisma.color.update({
    where: {
      idColor: id,
    },
    data: datosActualizacion,
  });
};

/**
 * @function eliminarColor
 * @brief Realiza un borrado lógico (soft delete) de un color.
 * @param {number} id - El ID del color a desactivar.
 * @returns {Promise<object>} El objeto del color con el estado actualizado a 'inactivo'.
 * @description En lugar de borrar el registro, esta función cambia el estado del color a 'inactivo',
 * lo que permite mantener la integridad referencial en registros históricos.
 */
const eliminarColor = async (id) => {
  return prisma.color.update({
    where: {
      idColor: id,
    },
    data: {
      estado: 'inactivo',
    },
  });
};

// Exportar las funciones del servicio para que puedan ser utilizadas por el controlador
module.exports = {
  obtenerTodosLosColores,
  obtenerColorPorId,
  crearColor,
  actualizarColor,
  eliminarColor,
};
