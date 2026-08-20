
/**
 * @file coloresController.js
 * @brief Controlador para gestionar las solicitudes HTTP relacionadas con los colores.
 *
 * Este archivo define los manejadores para las rutas de la API de colores.
 * Se encarga de recibir las solicitudes, validarlas, llamar al servicio
 * correspondiente y enviar una respuesta estandarizada al cliente.
 */

// Importaciones de módulos y helpers
const coloresService = require('./coloresService');
const {
  respuestaExitosa,
  respuestaCreada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

/**
 * @function listarColores
 * @brief Maneja la solicitud para obtener todos los colores.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Llama al servicio para obtener todos los colores y los envía
 * en una respuesta exitosa. Si ocurre un error, lo maneja.
 */
const listarColores = capturarErroresAsync(async (req, res) => {
  const colores = await coloresService.obtenerTodosLosColores();
  res.status(200).json(respuestaExitosa(colores, 'Colores listados exitosamente.'));
});

/**
 * @function obtenerColorPorId
 * @brief Maneja la solicitud para obtener un color por su ID.
 * @param {object} req - Objeto de solicitud de Express con el ID en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Valida el ID, busca el color y lo devuelve si existe.
 * Si no se encuentra, envía un error 404.
 */
const obtenerColorPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El ID proporcionado no es un número válido.',
      timestamp: new Date().toISOString()
    });
  }

  const color = await coloresService.obtenerColorPorId(Number(id));
  if (!color) {
    return res.status(404).json({
      exito: false,
      mensaje: 'Color no encontrado.',
      timestamp: new Date().toISOString()
    });
  }
  res.status(200).json(respuestaExitosa(color, 'Color obtenido exitosamente.'));
});

/**
 * @function crearColor
 * @brief Maneja la solicitud para crear un nuevo color.
 * @param {object} req - Objeto de solicitud de Express con los datos en `req.body`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Valida los datos de entrada, crea el nuevo color a través del servicio
 * y devuelve el resultado. Maneja errores de validación y duplicados.
 */
const crearColor = capturarErroresAsync(async (req, res) => {
  const datosColor = req.body;
  if (!datosColor.nombreColor) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El campo "nombreColor" es obligatorio.',
      timestamp: new Date().toISOString()
    });
  }

  const nuevoColor = await coloresService.crearColor(datosColor);
  res.status(201).json(respuestaCreada(nuevoColor, 'Color creado exitosamente.'));
});

/**
 * @function actualizarColor
 * @brief Maneja la solicitud para actualizar un color existente.
 * @param {object} req - Objeto de solicitud con ID en `req.params` y datos en `req.body`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Actualiza un color por su ID. Maneja el caso en que el color
 * no se encuentre o si hay un conflicto de datos (ej. nombre duplicado).
 */
const actualizarColor = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const datosActualizacion = req.body;

  if (isNaN(id)) {
    return res.status(400).json({
      exito: false,
      mensaje: 'El ID proporcionado no es un número válido.',
      timestamp: new Date().toISOString()
    });
  }

  const colorActualizado = await coloresService.actualizarColor(Number(id), datosActualizacion);
  res.status(200).json(respuestaExitosa(colorActualizado, 'Color actualizado exitosamente.'));
});

/**
 * @function eliminarColor
 * @brief Maneja la solicitud para "eliminar" (desactivar) un color.
 * @param {object} req - Objeto de solicitud con el ID en `req.params`.
 * @param {object} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
 * @description Realiza un borrado lógico del color, cambiando su estado a 'inactivo'.
 * Maneja el caso en que el color a eliminar no se encuentre.
 */
const eliminarColor = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El ID proporcionado no es un número válido.',
        timestamp: new Date().toISOString()
      });
    }

    await coloresService.eliminarColor(Number(id));
    sendSuccess(res, null, 'Color desactivado exitosamente.');
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        exito: false,
        mensaje: 'Color no encontrado para eliminar.',
        timestamp: new Date().toISOString()
      });
    }
    manejarError(error, req, res);
  }
};

// Exportar los manejadores para su uso en el archivo de rutas
module.exports = {
  listarColores,
  obtenerColorPorId,
  crearColor,
  actualizarColor,
  eliminarColor,
};
