
/**
 * @file validationHelper.js
 * @brief Ayudantes y middlewares para la validación de datos usando express-validator.
 *
 * Este archivo proporciona un conjunto de cadenas de validación reutilizables y un
 * middleware para manejar los resultados de la validación de forma centralizada.
 * Se integra con el `errorHelper` para lanzar errores de validación estandarizados.
 */

const { body, param, query, validationResult } = require('express-validator');
const { ErrorValidacion } = require('./errorHelper');

/**
 * @function manejarResultadosValidacion
 * @brief Middleware para procesar los resultados de las validaciones de express-validator.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @description
 * Este middleware debe ser el último en una cadena de validaciones.
 * Recopila todos los errores de validación. Si encuentra alguno, formatea los
 * mensajes y pasa un `ErrorValidacion` al siguiente middleware de manejo de errores.
 * Si no hay errores, simplemente continúa con el siguiente middleware.
 */
const manejarResultadosValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    // Formatear los errores para que sean más legibles
    const erroresFormateados = errores.array().map(err => ({
      campo: err.param,
      mensaje: err.msg,
      valor: err.value,
    }));
    console.log('--- ERRORES DE VALIDACIÓN DETECTADOS ---');
    console.log(JSON.stringify(erroresFormateados, null, 2));
    // Lanzar un error de validación personalizado que será capturado por el manejador de errores global
    return next(new ErrorValidacion('Los datos proporcionados no son válidos.', erroresFormateados));
  }
  next();
};

/**
 * @namespace validadores
 * @brief Colección de cadenas de validación reutilizables para diferentes tipos de datos.
 */
const validadores = {
  /**
   * Valida un ID numérico en los parámetros de la URL (ej: /recurso/:id).
   * @param {string} nombreParametro - El nombre del parámetro en la URL (ej: 'id').
   * @returns {object} Una cadena de validación de express-validator.
   */
  idEnParametro: (nombreParametro = 'id') =>
    param(nombreParametro)
      .isInt({ min: 1 })
      .withMessage(`El parámetro '${nombreParametro}' debe ser un número entero positivo.`),

  /**
   * Valida un campo de texto en el cuerpo de la solicitud.
   * @param {string} nombreCampo - El nombre del campo a validar.
   * @param {object} [opciones] - Opciones de configuración.
   * @param {boolean} [opciones.opcional=false] - Si es true, el campo es opcional.
   * @param {number} [opciones.min=1] - Longitud mínima del texto.
   * @param {number} [opciones.max] - Longitud máxima del texto.
   * @returns {object} Una cadena de validación de express-validator.
   */
  texto: (nombreCampo, { opcional = false, min = 1, max } = {}) => {
    let validador = body(nombreCampo);
    if (opcional) {
      validador = validador.optional();
    }
    
    validador = validador
      .trim()
      .isLength({ min })
      .withMessage(`El campo '${nombreCampo}' debe tener al menos ${min} caracteres.`);

    if (max) {
      validador = validador
        .isLength({ max })
        .withMessage(`El campo '${nombreCampo}' no puede exceder los ${max} caracteres.`);
    }
    return validador;
  },

  /**
   * Valida un campo de correo electrónico.
   * @param {string} nombreCampo - El nombre del campo (ej: 'correoElectronico').
   * @param {object} [opciones] - Opciones de configuración.
   * @param {boolean} [opciones.opcional=false] - Si es true, el campo es opcional.
   * @returns {object} Una cadena de validación de express-validator.
   */
  email: (nombreCampo, { opcional = false } = {}) => {
    let validador = body(nombreCampo);
    if (opcional) {
      validador = validador.optional({ checkFalsy: true }); // Acepta null o string vacío si es opcional
    }
    return validador
      .trim()
      .isEmail()
      .withMessage(`El campo '${nombreCampo}' debe ser una dirección de correo electrónico válida.`)
      .normalizeEmail();
  },

  /**
   * Valida un campo numérico.
   * @param {string} nombreCampo - El nombre del campo a validar.
   * @param {object} [opciones] - Opciones de configuración.
   * @param {boolean} [opciones.esDecimal=false] - Si es true, valida como número decimal.
   * @param {number} [opciones.min] - Valor mínimo permitido.
   * @param {number} [opciones.max] - Valor máximo permitido.
   * @returns {object} Una cadena de validación de express-validator.
   */
  numero: (nombreCampo, { opcional = false, esDecimal = false, min, max } = {}) => {
    let validador = body(nombreCampo);
     if (opcional) {
      validador = validador.optional();
    }

    validador = esDecimal 
        ? validador.isFloat().withMessage(`El campo '${nombreCampo}' debe ser un número decimal.`)
        : validador.isInt().withMessage(`El campo '${nombreCampo}' debe ser un número entero.`);

    if (min !== undefined) {
        validador = validador.custom(value => value >= min).withMessage(`El valor de '${nombreCampo}' debe ser como mínimo ${min}.`);
    }
     if (max !== undefined) {
        validador = validador.custom(value => value <= max).withMessage(`El valor de '${nombreCampo}' no puede ser mayor que ${max}.`);
    }

    return validador.toFloat(); // Convierte el valor a número
  },

  /**
   * Valida un campo booleano.
   * @param {string} nombreCampo - El nombre del campo.
   * @returns {object} Una cadena de validación de express-validator.
   */
  booleano: (nombreCampo) =>
    body(nombreCampo)
      .optional()
      .isBoolean()
      .withMessage(`El campo '${nombreCampo}' debe ser un valor booleano (true o false).`)
      .toBoolean(),
  
  /**
   * Valida que un campo pertenezca a una lista de valores permitidos (enum).
   * @param {string} nombreCampo - El nombre del campo.
   * @param {Array<string>} valoresPermitidos - El arreglo de valores permitidos.
   * @returns {object} Una cadena de validación de express-validator.
   */
  enum: (nombreCampo, valoresPermitidos) =>
    body(nombreCampo)
        .isIn(valoresPermitidos)
        .withMessage(`El campo '${nombreCampo}' debe ser uno de los siguientes valores: ${valoresPermitidos.join(', ')}.`),

  /**
   * Valida los parámetros de paginación en la query string.
   * @returns {Array<object>} Un arreglo de cadenas de validación.
   */
  paginacion: () => [
    query('pagina')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El parámetro de página debe ser un número entero positivo.')
      .toInt(),
    query('limite')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El parámetro de límite debe ser un entero entre 1 y 100.')
      .toInt(),
    query('ordenarPor')
      .optional()
      .isString()
      .withMessage("El campo 'ordenarPor' debe ser texto."),
    query('direccion')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage("El campo 'direccion' debe ser 'asc' o 'desc'.")
  ],

  /**
   * Valida una contraseña, exigiendo una complejidad mínima.
   * @param {string} nombreCampo - El nombre del campo de la contraseña.
   * @returns {object} Una cadena de validación de express-validator.
   */
  contrasena: (nombreCampo = 'contrasena') =>
    body(nombreCampo)
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres.')
      .matches(/\d/)
      .withMessage('La contraseña debe contener al menos un número.')
      .matches(/[a-z]/)
      .withMessage('La contraseña debe contener al menos una letra minúscula.')
      .matches(/[A-Z]/)
      .withMessage('La contraseña debe contener al menos una letra mayúscula.')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('La contraseña debe contener al menos un carácter especial.')
};

module.exports = {
  manejarResultadosValidacion,
  handleValidationErrors: manejarResultadosValidacion, // Alias for backward compatibility
  validadores,
};
