/**
 * Middleware global para el manejo de errores en la aplicación Express.
 * Captura todos los errores, los formatea y envía una respuesta estandarizada.
 */

// Importar helpers y configuración necesarios
const {
  configuracionServidor
} = require('../config/serverConfig');
const {
  respuestaError
} = require('../utils/responseHelper');
const {
  ErrorPersonalizado,
  ErrorInternoServidor,
  formatearErrorPrisma
} = require('../utils/errorHelper');

/**
 * Manejador de errores global.
 * Este middleware se debe registrar al final de la cadena de middlewares de Express.
 *
 * @param {Error} error - El objeto de error capturado.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware (no se usa aquí, pero es requerida por Express).
 */
const manejadorDeErrores = (error, req, res, next) => {
  // 1. Loggear el error para propósitos de depuración
  // Se loggea de manera diferente si es un error operacional o un error inesperado del sistema.
  const nivelLog = (error instanceof ErrorPersonalizado && error.esOperacional) ? 'warn' : 'error';
  console[nivelLog]('--- ERROR CAPTURADO ---');
  console[nivelLog](`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console[nivelLog]('Error:', error.message);
  if (nivelLog === 'error') {
    // Para errores críticos, loggear el stack completo
    console[nivelLog]('Stack Trace:', error.stack);
  }
  console[nivelLog]('--- FIN ERROR ---');


  // 2. Determinar el tipo de error y estandarizarlo
  let errorManejado = error;

  if (!(error instanceof ErrorPersonalizado)) {
    // Si el error es de Prisma (tienen un 'code' específico como 'P2002')
    if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
      errorManejado = formatearErrorPrisma(error);
    }
    // Para cualquier otro error no controlado, se encapsula como un error interno del servidor.
    // Esto previene la fuga de detalles sensibles del sistema en producción.
    else {
      errorManejado = new ErrorInternoServidor('Ha ocurrido un error inesperado en el servidor.', error);
    }
  }


  // 3. Preparar la respuesta de error estandarizada
  const statusCode = errorManejado.statusCode || 500;
  let mensaje = errorManejado.message;

  // En entorno de producción, los errores 500 deben tener un mensaje genérico
  // para no exponer detalles de la implementación.
  if (configuracionServidor.esProduccion && statusCode === 500) {
    mensaje = 'Error interno del servidor. Por favor, intente más tarde.';
  }

  // Usar el helper de respuestas para crear el cuerpo de la respuesta
  const cuerpoRespuesta = respuestaError(
    mensaje,
    statusCode,
    errorManejado.errores || null, // Detalles de validación, si existen
    errorManejado.codigo || 'ERROR_DESCONOCIDO'
  );

  // 4. Agregar información adicional en modo de desarrollo
  if (configuracionServidor.esDesarrollo) {
    cuerpoRespuesta.desarrollo = {
      tipoError: errorManejado.name,
      stack: error.stack, // El stack original es más útil
      errorOriginal: error.message
    };
  }

  // 5. Enviar la respuesta de error al cliente
  res.status(cuerpoRespuesta.statusCode || statusCode).json(cuerpoRespuesta);
};

/**
 * Middleware para capturar rutas no encontradas (404).
 * Se debe colocar después de todas las rutas definidas.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
const noEncontrado = (req, res, next) => {
  const mensaje = `No se pudo encontrar el recurso: ${req.method} ${req.originalUrl}`;
  const cuerpoRespuesta = respuestaError(mensaje, 404, null, 'RUTA_NO_ENCONTRADA');

  res.status(404).json(cuerpoRespuesta);
};

module.exports = {
  manejadorDeErrores,
  noEncontrado,
};
