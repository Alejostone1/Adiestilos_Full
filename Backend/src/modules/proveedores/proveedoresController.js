/**
 * @file proveedoresController.js
 * @brief Controlador para la gestión de proveedores en la API.
 *
 * Este archivo contiene los manejadores de rutas para las operaciones CRUD
 * (Crear, Leer, Actualizar, Eliminar) sobre el modelo de Proveedores.
 * Utiliza el servicio de proveedores para interactuar con la base de datos
 * y helpers para estandarizar las respuestas y el manejo de errores.
 */

// Importaciones de módulos y helpers necesarios
const proveedoresService = require('./proveedoresService');
const {
  respuestaExitosa,
  respuestaCreada,
  respuestaPaginada
} = require('../../utils/responseHelper');
const {
  capturarErroresAsync
} = require('../../utils/errorHelper');

const listarProveedores = capturarErroresAsync(async (req, res) => {
  const {
    datos,
    paginacion
  } = await proveedoresService.obtenerTodos(req.query, req.query);
  res.status(200).json(respuestaPaginada(datos, paginacion, 'Proveedores listados exitosamente.'));
});

const obtenerProveedor = capturarErroresAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const proveedor = await proveedoresService.obtenerPorId(id);
  res.status(200).json(respuestaExitosa(proveedor, 'Proveedor obtenido exitosamente.'));
});

/**
 * @function crearProveedor
 * @brief Crea un nuevo proveedor en la base de datos.
 * @param {object} req - Objeto de solicitud de Express, con los datos del proveedor en `req.body`.
 * @param {object} res - Objeto de respuesta de Express.
 * @description
 * Valida los datos de entrada (nombre y nit/cédula) y, si son correctos,
 * crea un nuevo proveedor utilizando el servicio `proveedoresService`.
 * Devuelve el proveedor creado con un código de estado 201.
 */
const crearProveedor = capturarErroresAsync(async (req, res) => {
  const nuevoProveedor = await proveedoresService.crear(req.body);
  res.status(201).json(respuestaCreada(nuevoProveedor, 'Proveedor creado exitosamente.'));
});


/**
 * @function actualizarProveedor
 * @brief Actualiza la información de un proveedor existente.
 * @param {object} req - Objeto de solicitud de Express, con ID en `req.params` y datos en `req.body`.
 * @param {object} res - Objeto de respuesta de Express.
 * @description
 * Actualiza los datos de un proveedor específico. Valida que el ID sea un número
 * y maneja el caso de que el proveedor no exista.
 */
const actualizarProveedor = capturarErroresAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const proveedorActualizado = await proveedoresService.actualizar(id, req.body);
  res.status(200).json(respuestaExitosa(proveedorActualizado, 'Proveedor actualizado exitosamente.'));
});

/**
 * @function eliminarProveedor
 * @brief Realiza un borrado lógico (soft delete) de un proveedor.
 * @param {object} req - Objeto de solicitud de Express, con el ID en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @description
 * En lugar de borrar el registro, cambia el estado del proveedor a 'inactivo'.
 * Esta es una mejor práctica para mantener la integridad de los datos históricos.
 */
const eliminarProveedor = capturarErroresAsync(async (req, res) => {
  const {
    id
  } = req.params;
  const proveedorDesactivado = await proveedoresService.desactivar(id);
  res.status(200).json(respuestaExitosa(proveedorDesactivado, 'Proveedor desactivado exitosamente.'));
});

// Exportar todos los controladores para ser utilizados en las rutas
module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};