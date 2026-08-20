/**
 * Helpers para manejo de errores personalizados
 * Proporciona clases de error personalizadas y funciones de formateo
 */

/**
 * Clase base para errores personalizados
 * Extiende la clase Error nativa de JavaScript
 */
class ErrorPersonalizado extends Error {
  /**a
   * Constructor de la clase ErrorPersonalizado
   * @param {string} mensaje - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP
   * @param {string} codigo - Código de error personalizado
   * @param {boolean} esOperacional - Indica si es un error operacional (predecible)
   */
  constructor(mensaje, statusCode = 500, codigo = 'ERROR_INTERNO', esOperacional = true) {
    super(mensaje);

    this.nombre = this.constructor.name;
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.esOperacional = esOperacional;
    this.timestamp = new Date().toISOString();

    // Capturar el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación - Para errores de validación de datos
 */
class ErrorValidacion extends ErrorPersonalizado {
  /**
   * Constructor para errores de validación
   * @param {string} mensaje - Mensaje del error de validación
   * @param {Array} errores - Lista detallada de errores de validación
   */
  constructor(mensaje = 'Los datos proporcionados no son válidos', errores = []) {
    super(mensaje, 400, 'VALIDACION_ERROR', true);
    this.errores = Array.isArray(errores) ? errores : [errores];
  }
}

/**
 * Error de recurso no encontrado
 */
class ErrorNoEncontrado extends ErrorPersonalizado {
  /**
   * Constructor para errores de recurso no encontrado
   * @param {string} recurso - Nombre del recurso que no se encontró
   * @param {string} identificador - Identificador del recurso (opcional)
   */
  constructor(recurso = 'recurso', identificador = null) {
    const mensaje = identificador
      ? `El ${recurso} con identificador '${identificador}' no fue encontrado`
      : `El ${recurso} solicitado no fue encontrado`;

    super(mensaje, 404, 'NO_ENCONTRADO', true);
    this.recurso = recurso;
    this.identificador = identificador;
  }
}

/**
 * Error de no autorizado - Para acceso sin autenticación
 */
class ErrorNoAutorizado extends ErrorPersonalizado {
  /**
   * Constructor para errores de no autorizado
   * @param {string} mensaje - Mensaje personalizado (opcional)
   */
  constructor(mensaje = 'No tienes permisos para acceder a este recurso') {
    super(mensaje, 401, 'NO_AUTORIZADO', true);
  }
}

/**
 * Error de prohibido - Para acceso denegado por permisos
 */
class ErrorProhibido extends ErrorPersonalizado {
  /**
   * Constructor para errores de prohibido
   * @param {string} mensaje - Mensaje personalizado (opcional)
   */
  constructor(mensaje = 'No tienes permisos suficientes para realizar esta acción') {
    super(mensaje, 403, 'PROHIBIDO', true);
  }
}

/**
 * Error de conflicto - Para conflictos de estado o datos duplicados
 */
class ErrorConflicto extends ErrorPersonalizado {
  /**
   * Constructor para errores de conflicto
   * @param {string} mensaje - Mensaje descriptivo del conflicto
   * @param {string} campo - Campo que causa el conflicto (opcional)
   */
  constructor(mensaje, campo = null) {
    super(mensaje, 409, 'CONFLICTO', true);
    this.campo = campo;
  }
}

/**
 * Error de solicitud incorrecta - Para errores generales del cliente
 */
class ErrorSolicitudIncorrecta extends ErrorPersonalizado {
  /**
   * Constructor para errores de solicitud incorrecta
   * @param {string} mensaje - Mensaje del error
   */
  constructor(mensaje = 'La solicitud contiene datos incorrectos') {
    super(mensaje, 400, 'SOLICITUD_INCORRECTA', true);
  }
}

/**
 * Error interno del servidor - Para errores no esperados
 */
class ErrorInternoServidor extends ErrorPersonalizado {
  /**
   * Constructor para errores internos del servidor
   * @param {string} mensaje - Mensaje del error (opcional)
   * @param {Error} errorOriginal - Error original que causó este error
   */
  constructor(mensaje = 'Ha ocurrido un error interno en el servidor', errorOriginal = null) {
    super(mensaje, 500, 'ERROR_INTERNO_SERVIDOR', false);
    this.errorOriginal = errorOriginal;
  }
}

/**
 * Error de base de datos - Para errores relacionados con la BD
 */
class ErrorBaseDatos extends ErrorPersonalizado {
  /**
   * Constructor para errores de base de datos
   * @param {string} mensaje - Mensaje del error
   * @param {string} operacion - Operación que causó el error (opcional)
   */
  constructor(mensaje, operacion = null) {
    super(mensaje, 500, 'ERROR_BASE_DATOS', false);
    this.operacion = operacion;
  }
}

/**
 * Formatear errores de Prisma a errores personalizados
 * @param {Error} error - Error de Prisma
 * @returns {ErrorPersonalizado} Error personalizado formateado
 */
function formatearErrorPrisma(error) {
  // Errores de Prisma conocidos
  const erroresPrisma = {
    P1001: 'No se puede conectar a la base de datos',
    P1008: 'Tiempo de espera agotado para operaciones en la base de datos',
    P1017: 'La conexión a la base de datos se cerró',
    P2000: 'El valor proporcionado es demasiado largo para el campo',
    P2001: 'Registro no encontrado',
    P2002: 'Violación de restricción única',
    P2003: 'Violación de restricción de clave externa',
    P2004: 'Violación de restricción de verificación',
    P2014: 'Violación de restricción de cambio',
    P2015: 'Registro relacionado no encontrado',
    P2018: 'Registro requerido no encontrado',
    P2019: 'Error de entrada',
    P2025: 'Registro a actualizar no encontrado',
    P2028: 'Transacción fallida'
  };

  const codigo = error.code;
  const mensajeOriginal = error.message;

  // Si es un código conocido de Prisma
  if (codigo && erroresPrisma[codigo]) {
    let mensaje = erroresPrisma[codigo];
    let statusCode = 500;
    let tipoError = ErrorInternoServidor;

    switch (codigo) {
      case 'P2001':
      case 'P2015':
      case 'P2018':
      case 'P2025':
        tipoError = ErrorNoEncontrado;
        statusCode = 404;
        mensaje = 'El registro solicitado no existe';
        break;

      case 'P2002':
        tipoError = ErrorConflicto;
        statusCode = 409;
        mensaje = 'Ya existe un registro con estos datos únicos';
        break;

      case 'P2003':
        tipoError = ErrorValidacion;
        statusCode = 400;
        mensaje = 'Los datos proporcionados violan restricciones de integridad';
        break;

      case 'P2000':
      case 'P2004':
      case 'P2019':
        tipoError = ErrorValidacion;
        statusCode = 400;
        mensaje = 'Los datos proporcionados no cumplen con los requisitos';
        break;

      default:
        tipoError = ErrorBaseDatos;
        mensaje = 'Error en la operación de base de datos';
    }

    return new tipoError(mensaje);
  }

  // Si no es un código conocido, devolver error genérico
  return new ErrorBaseDatos(`Error de base de datos: ${mensajeOriginal}`);
}

/**
 * Formatear errores de validación (ej: Joi, express-validator)
 * @param {Array} errores - Lista de errores de validación
 * @returns {ErrorValidacion} Error de validación formateado
 */
function formatearErroresValidacion(errores) {
  if (!Array.isArray(errores) || errores.length === 0) {
    return new ErrorValidacion('Errores de validación encontrados');
  }

  // Extraer mensajes de error
  const mensajesError = errores.map(error => {
    if (typeof error === 'string') {
      return error;
    }
    return error.message || error.msg || 'Error de validación';
  });

  return new ErrorValidacion('Los datos proporcionados no son válidos', mensajesError);
}

/**
 * Manejar errores de manera centralizada
 * Función para usar en middlewares de Express
 * @param {Error} error - Error a manejar
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
function manejarError(error, req, res, next) {
  let errorFormateado = error;

  // Si no es un error personalizado, convertirlo
  if (!(error instanceof ErrorPersonalizado)) {
    // Verificar si es un error de Prisma
    if (error.code && error.code.startsWith('P')) {
      errorFormateado = formatearErrorPrisma(error);
    }
    // Verificar si es un error de validación
    else if (error.errors || error.details) {
      const errores = error.errors || error.details;
      errorFormateado = formatearErroresValidacion(errores);
    }
    // Error genérico
    else {
      errorFormateado = new ErrorInternoServidor(error.message, error);
    }
  }

  // Logging del error
  const nivelLog = errorFormateado.esOperacional ? 'warn' : 'error';
  console[nivelLog](`[${errorFormateado.nombre}] ${errorFormateado.message}`, {
    codigo: errorFormateado.codigo,
    statusCode: errorFormateado.statusCode,
    ruta: req.originalUrl,
    metodo: req.method,
    ip: req.ip,
    timestamp: errorFormateado.timestamp,
    stack: errorFormateado.stack
  });

  // Enviar respuesta de error
  const respuesta = {
    exito: false,
    mensaje: errorFormateado.message,
    codigo: errorFormateado.codigo,
    timestamp: errorFormateado.timestamp
  };

  // Agregar errores detallados en desarrollo
  if (process.env.NODE_ENV === 'development' && errorFormateado.errores) {
    respuesta.errores = errorFormateado.errores;
  }

  // Agregar información adicional para errores específicos
  if (errorFormateado instanceof ErrorNoEncontrado) {
    respuesta.recurso = errorFormateado.recurso;
    if (errorFormateado.identificador) {
      respuesta.identificador = errorFormateado.identificador;
    }
  }

  if (errorFormateado instanceof ErrorConflicto && errorFormateado.campo) {
    respuesta.campo = errorFormateado.campo;
  }

  res.status(errorFormateado.statusCode).json(respuesta);
}

/**
 * Middleware para capturar errores asíncronos
 * @param {Function} fn - Función asíncrona a envolver
 * @returns {Function} Función envuelta con manejo de errores
 */
function capturarErroresAsync(fn) {
  return (req, res, next) => {
    const promesa = fn(req, res, next);
    if (promesa && typeof promesa.catch === 'function') {
      promesa.catch(next);
    }
  };
}

/**
 * Crear error personalizado de manera conveniente
 * @param {string} tipo - Tipo de error ('validacion', 'noEncontrado', etc.)
 * @param {string} mensaje - Mensaje del error
 * @param {...any} args - Argumentos adicionales según el tipo
 * @returns {ErrorPersonalizado} Instancia del error correspondiente
 */
function crearError(tipo, mensaje, ...args) {
  const tiposErrores = {
    validacion: ErrorValidacion,
    noEncontrado: ErrorNoEncontrado,
    noAutorizado: ErrorNoAutorizado,
    prohibido: ErrorProhibido,
    conflicto: ErrorConflicto,
    solicitudIncorrecta: ErrorSolicitudIncorrecta,
    internoServidor: ErrorInternoServidor,
    baseDatos: ErrorBaseDatos
  };

  const ClaseError = tiposErrores[tipo];
  if (!ClaseError) {
    throw new Error(`Tipo de error desconocido: ${tipo}`);
  }

  return new ClaseError(mensaje, ...args);
}

/**
 * Manejar errores HTTP de manera sencilla
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} mensaje - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP (opcional, por defecto 500)
 */
function handleHttpError(res, mensaje, statusCode = 500) {
  const { respuestaError } = require('./responseHelper');
  
  const respuesta = respuestaError(mensaje, statusCode, null, 'HTTP_ERROR');
  res.status(statusCode).json(respuesta);
}

// Exportar todas las clases y funciones
module.exports = {
  // Clases de error
  ErrorPersonalizado,
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorNoAutorizado,
  ErrorProhibido,
  ErrorConflicto,
  ErrorSolicitudIncorrecta,
  ErrorInternoServidor,
  ErrorBaseDatos,

  // Funciones de formateo
  formatearErrorPrisma,
  formatearErroresValidacion,

  // Funciones de manejo
  manejarError,
  capturarErroresAsync,
  crearError,
  handleHttpError
};
