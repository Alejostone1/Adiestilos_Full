
/**
 * @file rolesService.js
 * @brief Servicio para la lógica de negocio relacionada con los roles de usuario.
 *
 * Este archivo se encarga de las operaciones de la base de datos para el modelo Rol.
 * Proporciona una capa de abstracción para consultar, crear, actualizar y eliminar roles,
 * incluyendo validaciones de negocio como la prevención de eliminación de roles en uso.
 */

const { prisma } = require('../../config/databaseConfig');
const { ErrorConflicto } = require('../../utils/errorHelper');

/**
 * @function obtenerTodosLosRoles
 * @brief Recupera todos los roles de la base de datos.
 * @returns {Promise<Array>} Una lista de todos los roles.
 * @description Consulta todos los roles y, para cada uno, incluye un conteo de
 * cuántos usuarios están asignados a él. Se ordena por nombre de rol.
 */
const obtenerTodosLosRoles = async () => {
  return prisma.rol.findMany({
    include: {
      _count: {
        select: { usuarios: true },
      },
    },
    orderBy: {
      nombreRol: 'asc',
    },
  });
};

/**
 * @function obtenerRolPorId
 * @brief Busca un rol específico por su ID.
 * @param {number} id - El ID del rol a buscar.
 * @returns {Promise<object|null>} El objeto del rol si se encuentra, de lo contrario null.
 * @description Realiza una búsqueda para encontrar un rol por su ID, incluyendo
 * también el conteo de usuarios asociados.
 */
const obtenerRolPorId = async (id) => {
  return prisma.rol.findUnique({
    where: { idRol: id },
    include: {
      _count: {
        select: { usuarios: true },
      },
    },
  });
};

/**
 * @function crearRol
 * @brief Crea un nuevo registro de rol.
 * @param {object} datosRol - Un objeto que contiene los datos del nuevo rol
 * (nombreRol, descripcion, permisos).
 * @returns {Promise<object>} El objeto del rol recién creado.
 * @description Inserta un nuevo rol en la base de datos. El campo 'permisos'
 * debe ser un objeto JSON.
 */
const crearRol = async (datosRol) => {
  // Asegurarse de que los permisos se guarden como JSON si se proporcionan
  if (datosRol.permisos && typeof datosRol.permisos === 'string') {
    datosRol.permisos = JSON.parse(datosRol.permisos);
  }
  return prisma.rol.create({
    data: datosRol,
  });
};

/**
 * @function actualizarRol
 * @brief Actualiza un rol existente.
 * @param {number} id - El ID del rol a actualizar.
 * @param {object} datosActualizacion - Un objeto con los campos a actualizar.
 * @returns {Promise<object>} El objeto del rol actualizado.
 * @description Modifica un rol existente. Si se actualizan los permisos y
 * se reciben como string, se convierten a JSON.
 */
const actualizarRol = async (id, datosActualizacion) => {
  // Asegurarse de que los permisos se guarden como JSON si se proporcionan
  if (datosActualizacion.permisos && typeof datosActualizacion.permisos === 'string') {
    datosActualizacion.permisos = JSON.parse(datosActualizacion.permisos);
  }
  return prisma.rol.update({
    where: { idRol: id },
    data: datosActualizacion,
  });
};

/**
 * @function eliminarRol
 * @brief Elimina un rol de la base de datos.
 * @param {number} id - El ID del rol a eliminar.
 * @returns {Promise<object>} El objeto del rol eliminado.
 * @throws {ErrorConflicto} Si el rol tiene usuarios asignados.
 * @description Antes de eliminar, verifica si algún usuario tiene asignado el rol.
 * Si es así, impide la eliminación para mantener la integridad de los datos.
 * Si no hay usuarios asignados, procede con la eliminación (hard delete).
 */
const eliminarRol = async (id) => {
  // 1. Verificar si el rol tiene usuarios asignados.
  const conteoUsuarios = await prisma.usuario.count({
    where: { idRol: id },
  });

  // 2. Si hay usuarios, lanzar un error de conflicto.
  if (conteoUsuarios > 0) {
    throw new ErrorConflicto(`No se puede eliminar el rol porque tiene ${conteoUsuarios} usuario(s) asignado(s).`);
  }

  // 3. Si no hay usuarios, eliminar el rol.
  return prisma.rol.delete({
    where: { idRol: id },
  });
};

// Exportar las funciones para su uso en el controlador
module.exports = {
  obtenerTodosLosRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol,
};
