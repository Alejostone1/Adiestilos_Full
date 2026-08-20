/**
 * Helpers para estandarizar respuestas HTTP en la API
 * Proporciona funciones para crear respuestas consistentes y formateadas
 */

// Importar configuración del servidor para códigos de estado
const { configuracionServidor } = require('../config/serverConfig');

/**
 * Formato estándar de respuesta exitosa
 * @typedef {Object} RespuestaExitosa
 * @property {boolean} exito - Indica si la operación fue exitosa
 * @property {string} mensaje - Mensaje descriptivo de la respuesta
 * @property {any} datos - Datos de la respuesta (opcional)
 * @property {Object} metadata - Metadatos adicionales (opcional)
 * @property {number} timestamp - Marca de tiempo de la respuesta
 */

/**
 * Formato estándar de respuesta de error
 * @typedef {Object} RespuestaError
 * @property {boolean} exito - Siempre false para errores
 * @property {string} mensaje - Mensaje descriptivo del error
 * @property {Array} errores - Lista de errores detallados (opcional)
 * @property {string} codigo - Código de error (opcional)
 * @property {number} timestamp - Marca de tiempo de la respuesta
 */

/**
 * Formato estándar de respuesta paginada
 * @typedef {Object} RespuestaPaginada
 * @property {boolean} exito - Indica si la operación fue exitosa
 * @property {string} mensaje - Mensaje descriptivo de la respuesta
 * @property {Array} datos - Lista de elementos paginados
 * @property {Object} paginacion - Información de paginación
 * @property {number} paginacion.paginaActual - Página actual
 * @property {number} paginacion.totalPaginas - Total de páginas
 * @property {number} paginacion.totalRegistros - Total de registros
 * @property {number} paginacion.registrosPorPagina - Registros por página
 * @property {boolean} paginacion.tieneSiguiente - Si hay página siguiente
 * @property {boolean} paginacion.tieneAnterior - Si hay página anterior
 * @property {number} timestamp - Marca de tiempo de la respuesta
 */

/**
 * Crear una respuesta exitosa estandarizada
 * @param {any} datos - Datos a incluir en la respuesta
 * @param {string} mensaje - Mensaje descriptivo (opcional)
 * @param {number} statusCode - Código de estado HTTP (opcional, por defecto 200)
 * @param {Object} metadata - Metadatos adicionales (opcional)
 * @returns {Object} Objeto de respuesta formateado
 */
function respuestaExitosa(datos = null, mensaje = null, statusCode = 200, metadata = null) {
  // Usar mensaje por defecto si no se proporciona
  const mensajeFinal = mensaje || configuracionServidor.respuestas.exitosas.mensaje;

  // Validar parámetros
  validarParametrosRespuesta(datos, mensajeFinal, statusCode);

  // Crear respuesta base
  const respuesta = {
    exito: true,
    mensaje: mensajeFinal,
    timestamp: new Date().toISOString()
  };

  // Agregar datos si existen
  if (datos !== null && datos !== undefined) {
    respuesta.datos = datos;
  }

  // Agregar metadatos si existen
  if (metadata && typeof metadata === 'object') {
    respuesta.metadata = metadata;
  }

  return respuesta;
}

/**
 * Crear una respuesta de error estandarizada
 * @param {string} mensaje - Mensaje descriptivo del error
 * @param {number} statusCode - Código de estado HTTP (opcional, por defecto 500)
 * @param {Array|string} errores - Lista de errores detallados o mensaje de error único (opcional)
 * @param {string} codigo - Código de error personalizado (opcional)
 * @returns {Object} Objeto de respuesta de error formateado
 */
function respuestaError(mensaje, statusCode = 500, errores = null, codigo = null) {
  // Validar parámetros
  if (!mensaje || typeof mensaje !== 'string') {
    throw new Error('El mensaje de error es requerido y debe ser una cadena de texto');
  }

  if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
    throw new Error('El código de estado HTTP debe ser un número entre 100 y 599');
  }

  // Crear respuesta base
  const respuesta = {
    exito: false,
    mensaje: mensaje,
    timestamp: new Date().toISOString()
  };

  // Agregar errores si existen
  if (errores) {
    if (Array.isArray(errores)) {
      respuesta.errores = errores;
    } else if (typeof errores === 'string') {
      respuesta.errores = [errores];
    } else {
      respuesta.errores = [errores.toString()];
    }
  }

  // Agregar código de error si existe
  if (codigo && typeof codigo === 'string') {
    respuesta.codigo = codigo;
  }

  return respuesta;
}

/**
 * Crear una respuesta paginada estandarizada
 * @param {Array} datos - Lista de elementos a paginar
 * @param {Object} paginacion - Información de paginación
 * @param {number} paginacion.paginaActual - Página actual
 * @param {number} paginacion.totalRegistros - Total de registros
 * @param {number} paginacion.registrosPorPagina - Registros por página
 * @param {string} mensaje - Mensaje descriptivo (opcional)
 * @param {Object} metadata - Metadatos adicionales (opcional)
 * @returns {Object} Objeto de respuesta paginada formateado
 */
function respuestaPaginada(datos, paginacion, mensaje = null, metadata = null) {
  // Validar parámetros requeridos
  if (!Array.isArray(datos)) {
    throw new Error('Los datos deben ser un arreglo');
  }

  if (!paginacion || typeof paginacion !== 'object') {
    throw new Error('La información de paginación es requerida');
  }

  const {
    paginaActual,
    totalRegistros,
    registrosPorPagina
  } = paginacion;

  // Validar campos requeridos de paginación
  if (typeof paginaActual !== 'number' || paginaActual < 1) {
    throw new Error('La página actual debe ser un número mayor a 0');
  }

  if (typeof totalRegistros !== 'number' || totalRegistros < 0) {
    throw new Error('El total de registros debe ser un número no negativo');
  }

  if (typeof registrosPorPagina !== 'number' || registrosPorPagina < 1) {
    throw new Error('Los registros por página deben ser un número mayor a 0');
  }

  // Calcular información adicional de paginación
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const tieneSiguiente = paginaActual < totalPaginas;
  const tieneAnterior = paginaActual > 1;

  // Usar mensaje por defecto si no se proporciona
  const mensajeFinal = mensaje || 'Datos obtenidos exitosamente';

  // Crear respuesta base
  const respuesta = {
    exito: true,
    mensaje: mensajeFinal,
    datos: datos,
    paginacion: {
      paginaActual,
      totalPaginas,
      totalRegistros,
      registrosPorPagina,
      tieneSiguiente,
      tieneAnterior
    },
    timestamp: new Date().toISOString()
  };

  // Agregar metadatos si existen
  if (metadata && typeof metadata === 'object') {
    respuesta.metadata = metadata;
  }

  return respuesta;
}

/**
 * Validar parámetros comunes de respuesta
 * @private
 * @param {any} datos - Datos de la respuesta
 * @param {string} mensaje - Mensaje de la respuesta
 * @param {number} statusCode - Código de estado HTTP
 */
function validarParametrosRespuesta(datos, mensaje, statusCode) {
  if (mensaje && typeof mensaje !== 'string') {
    throw new Error('El mensaje debe ser una cadena de texto');
  }

  if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
    throw new Error('El código de estado HTTP debe ser un número entre 100 y 599');
  }
}

/**
 * Crear respuesta de creación exitosa (201)
 * @param {any} datos - Datos del recurso creado
 * @param {string} mensaje - Mensaje descriptivo (opcional)
 * @returns {Object} Respuesta formateada
 */
function respuestaCreada(datos, mensaje = null) {
  const mensajeFinal = mensaje || configuracionServidor.respuestas.creadas.mensaje;
  return respuestaExitosa(datos, mensajeFinal, 201);
}

/**
 * Crear respuesta sin contenido (204)
 * @param {string} mensaje - Mensaje descriptivo (opcional)
 * @returns {Object} Respuesta formateada
 */
function respuestaSinContenido(mensaje = null) {
  const mensajeFinal = mensaje || configuracionServidor.respuestas.sinContenido.mensaje;
  return respuestaExitosa(null, mensajeFinal, 204);
}

/**
 * Crear respuesta de error de cliente (400)
 * @param {string} mensaje - Mensaje del error
 * @param {Array|string} errores - Detalles del error (opcional)
 * @returns {Object} Respuesta de error formateada
 */
function respuestaErrorCliente(mensaje, errores = null) {
  return respuestaError(mensaje, 400, errores, 'BAD_REQUEST');
}

/**
 * Crear respuesta de no autorizado (401)
 * @param {string} mensaje - Mensaje del error (opcional)
 * @returns {Object} Respuesta de error formateada
 */
function respuestaNoAutorizado(mensaje = null) {
  const mensajeFinal = mensaje || configuracionServidor.respuestas.noAutorizado.mensaje;
  return respuestaError(mensajeFinal, 401, null, 'UNAUTHORIZED');
}

/**
 * Crear respuesta de prohibido (403)
 * @param {string} mensaje - Mensaje del error (opcional)
 * @returns {Object} Respuesta de error formateada
 */
function respuestaProhibido(mensaje = null) {
  const mensajeFinal = mensaje || configuracionServidor.respuestas.prohibido.mensaje;
  return respuestaError(mensajeFinal, 403, null, 'FORBIDDEN');
}

/**
 * Crear respuesta de no encontrado (404)
 * @param {string} mensaje - Mensaje del error (opcional)
 * @returns {Object} Respuesta de error formateada
 */
function respuestaNoEncontrado(mensaje = null) {
  const mensajeFinal = mensaje || configuracionServidor.respuestas.noEncontrado.mensaje;
  return respuestaError(mensajeFinal, 404, null, 'NOT_FOUND');
}

/**
 * Crear respuesta de conflicto (409)
 * @param {string} mensaje - Mensaje del error
 * @param {Array|string} errores - Detalles del conflicto (opcional)
 * @returns {Object} Respuesta de error formateada
 */
function respuestaConflicto(mensaje, errores = null) {
  return respuestaError(mensaje, 409, errores, 'CONFLICT');
}

/**
 * Crear respuesta de error del servidor (500)
 * @param {string} mensaje - Mensaje del error (opcional)
 * @param {Error} error - Objeto de error original (opcional)
 * @returns {Object} Respuesta de error formateada
 */
function respuestaErrorServidor(mensaje = null, error = null) {
  const mensajeFinal = mensaje || configuracionServidor.respuestas.errorServidor.mensaje;
  const errores = error ? [error.message] : null;
  return respuestaError(mensajeFinal, 500, errores, 'INTERNAL_SERVER_ERROR');
}

/**
 * Enviar respuesta exitosa de manera sencilla
 * @param {Object} res - Objeto de respuesta Express
 * @param {any} datos - Datos a incluir en la respuesta
 * @param {string} mensaje - Mensaje de éxito
 * @param {number} statusCode - Código de estado HTTP (opcional, por defecto 200)
 */
function sendSuccess(res, datos, mensaje, statusCode = 200) {
  const respuesta = respuestaExitosa(datos, mensaje, statusCode);
  res.status(statusCode).json(respuesta);
}

// Exportar todas las funciones de utilidad
module.exports = {
  // Funciones principales
  respuestaExitosa,
  respuestaError,
  respuestaPaginada,
  sendSuccess,

  // Funciones especializadas para respuestas exitosas
  respuestaCreada,
  respuestaSinContenido,

  // Funciones especializadas para errores comunes
  respuestaErrorCliente,
  respuestaNoAutorizado,
  respuestaProhibido,
  respuestaNoEncontrado,
  respuestaConflicto,
  respuestaErrorServidor
};
