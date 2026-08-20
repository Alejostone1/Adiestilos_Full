
/**
 * @file variantesController.js
 * @brief Controlador para las solicitudes HTTP del módulo de Variantes de Producto.
 *
 * Gestiona las peticiones para el recurso de variantes, validando la entrada,
 * invocando los servicios correspondientes y formateando la respuesta al cliente.
 */

const variantesService = require('./variantesService');
const { sendSuccess } = require('../../utils/responseHelper');
const { handleHttpError } = require('../../utils/errorHelper');

/**
 * @function listarVariantes
 * @brief Maneja la solicitud para obtener una lista de variantes.
 * @param {object} req - Objeto de solicitud de Express. Puede contener `productoId` en `req.query`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Obtiene variantes, opcionalmente filtradas por ID de producto.
 */
const listarVariantes = async (req, res) => {
  try {
    const { productoId } = req.query;
    const productoIdNum = productoId ? parseInt(productoId, 10) : undefined;
    
    if (productoId && isNaN(productoIdNum)) {
        return handleHttpError(res, 'El "productoId" debe ser un número válido.', 400);
    }

    const variantes = await variantesService.obtenerVariantes(productoIdNum);
    sendSuccess(res, variantes, 'Variantes listadas exitosamente.');
  } catch (error) {
    handleHttpError(res, 'Error al listar las variantes.');
  }
};

/**
 * @function obtenerVariantesPorProducto
 * @brief Maneja la solicitud para obtener variantes de un producto específico.
 * @param {object} req - Objeto de solicitud con el ID del producto en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Obtiene todas las variantes asociadas a un producto.
 */
const obtenerVariantesPorProducto = async (req, res) => {
  try {
    const { idProducto } = req.params;
    
    if (isNaN(idProducto)) {
      return handleHttpError(res, 'El ID del producto debe ser un número válido.', 400);
    }

    const variantes = await variantesService.obtenerVariantes(parseInt(idProducto, 10));
    sendSuccess(res, variantes, 'Variantes del producto obtenidas exitosamente.');
  } catch (error) {
    handleHttpError(res, 'Error al obtener las variantes del producto.');
  }
};

/**
 * @function obtenerVariantePorId
 * @brief Maneja la solicitud para obtener una variante por su ID.
 * @param {object} req - Objeto de solicitud con el ID en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Busca una variante por ID y la devuelve si existe.
 */
const obtenerVariantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return handleHttpError(res, 'El ID proporcionado no es un número válido.', 400);
    }

    const variante = await variantesService.obtenerVariantePorId(Number(id));
    if (!variante) {
      return handleHttpError(res, 'Variante no encontrada.', 404);
    }
    sendSuccess(res, variante, 'Variante obtenida exitosamente.');
  } catch (error) {
    handleHttpError(res, 'Error al obtener la variante.');
  }
};

/**
 * @function crearVariante
 * @brief Maneja la solicitud para crear una nueva variante.
 * @param {object} req - Objeto de solicitud con los datos en `req.body`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Valida datos, crea la variante y maneja errores de conflicto.
 * @requires {idProducto, codigoSku, precioVenta, precioCosto}
 */
const crearVariante = async (req, res) => {
  try {
    const datosVariante = req.body;
    const { idProducto, codigoSku, precioVenta, precioCosto } = datosVariante;

    // Validaciones de campos obligatorios
    if (!idProducto || !codigoSku || precioVenta === undefined || precioCosto === undefined) {
      return handleHttpError(res, 'Los campos "idProducto", "codigoSku", "precioVenta" y "precioCosto" son obligatorios.', 400);
    }

    // Validar que los precios sean números válidos positivos
    const precioVentaNum = Number(precioVenta);
    const precioCostoNum = Number(precioCosto);

    if (isNaN(precioVentaNum) || precioVentaNum <= 0) {
      return handleHttpError(res, 'precioVenta debe ser un número mayor a 0.', 400);
    }

    if (isNaN(precioCostoNum) || precioCostoNum < 0) {
      return handleHttpError(res, 'precioCosto debe ser un número mayor o igual a 0.', 400);
    }

    // Validar que precioVenta sea mayor que precioCosto (margen positivo)
    if (precioVentaNum <= precioCostoNum) {
      return handleHttpError(res, 'precioVenta debe ser mayor que precioCosto. El margen debe ser positivo.', 400);
    }

    const idUsuario = req.usuario.idUsuario;
    const nuevaVariante = await variantesService.crearVariante(datosVariante, idUsuario);
    sendSuccess(res, nuevaVariante, 'Variante creada exitosamente.', 201);
  } catch (error) {
    if (error.statusCode === 409) { // Conflicto por variante duplicada
        return handleHttpError(res, error.message, 409);
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('codigoSku')) {
      return handleHttpError(res, 'Ya existe una variante con el mismo SKU.', 409);
    }
    handleHttpError(res, 'Error al crear la variante.');
  }
};

/**
 * @function actualizarVariante
 * @brief Maneja la solicitud para actualizar una variante.
 * @param {object} req - Objeto de solicitud con ID y datos.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Actualiza una variante y maneja errores de conflicto o si no se encuentra.
 */
const actualizarVariante = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;

    if (isNaN(id)) {
      return handleHttpError(res, 'El ID proporcionado no es un número válido.', 400);
    }

    const varianteActualizada = await variantesService.actualizarVariante(Number(id), datosActualizacion);
    sendSuccess(res, varianteActualizada, 'Variante actualizada exitosamente.');
  } catch (error) {
    if (error.code === 'P2025') {
      return handleHttpError(res, 'Variante no encontrada para actualizar.', 404);
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('codigoSku')) {
      return handleHttpError(res, 'Ya existe otra variante con el mismo SKU.', 409);
    }
     if (error.code === 'P2002' && error.meta?.target?.includes('Producto_Color_Talla')) {
      return handleHttpError(res, 'Ya existe una variante con la misma combinación de producto, color y talla.', 409);
    }
    handleHttpError(res, 'Error al actualizar la variante.');
  }
};

/**
 * @function eliminarVariante
 * @brief Maneja la solicitud para desactivar una variante.
 * @param {object} req - Objeto de solicitud con ID.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Realiza un borrado lógico de la variante.
 */
const eliminarVariante = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return handleHttpError(res, 'El ID proporcionado no es un número válido.', 400);
    }

    await variantesService.eliminarVariante(Number(id));
    sendSuccess(res, null, 'Variante desactivada exitosamente.');
  } catch (error) {
    if (error.code === 'P2025') {
      return handleHttpError(res, 'Variante no encontrada para eliminar.', 404);
    }
    handleHttpError(res, 'Error al eliminar la variante.');
  }
};

// Exportar los manejadores
module.exports = {
  listarVariantes,
  obtenerVariantesPorProducto,
  obtenerVariantePorId,
  crearVariante,
  actualizarVariante,
  eliminarVariante,
};
