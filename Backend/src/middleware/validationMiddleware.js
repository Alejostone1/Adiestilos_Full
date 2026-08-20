/**
 * Middleware para validaciones de datos de entrada.
 * Proporciona una forma de definir y ejecutar reglas de validación
 * antes de que la solicitud llegue al controlador.
 */

const { ErrorValidacion } = require('../utils/errorHelper');
const { validationResult } = require('express-validator');

/**
 * Valida un objeto de datos contra un conjunto de reglas.
 * @param {object} datos - Los datos a validar (ej: req.body, req.params).
 * @param {object} reglas - Un objeto donde las claves son los campos a validar y los valores son las reglas.
 * @returns {Array<string>} Una lista de mensajes de error. Si está vacía, la validación fue exitosa.
 */
const ejecutarValidacion = (datos, reglas) => {
  const errores = [];

  for (const campo in reglas) {
    const reglasCampo = reglas[campo].split('|'); // ej: ['required', 'min:6']
    const valor = datos[campo];

    for (const regla of reglasCampo) {
      let [nombreRegla, arg] = regla.split(':'); // ej: ['min', '6']

      if (nombreRegla === 'required' && (valor === undefined || valor === null || valor === '')) {
        errores.push(`El campo '${campo}' es obligatorio.`);
        // Si es requerido y no está, no tiene sentido seguir validando este campo
        break; 
      }
      
      // Si el campo no es requerido y no se proveyó, no aplicar más reglas
      if (valor === undefined || valor === null || valor === '') continue;

      switch (nombreRegla) {
        case 'string':
          if (typeof valor !== 'string') {
            errores.push(`El campo '${campo}' debe ser una cadena de texto.`);
          }
          break;
        case 'numeric':
          if (isNaN(parseFloat(valor)) || !isFinite(valor)) {
            errores.push(`El campo '${campo}' debe ser un número.`);
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(valor)) {
            errores.push(`El campo '${campo}' no es un correo electrónico válido.`);
          }
          break;
        case 'min':
          const min = parseInt(arg, 10);
          if (typeof valor === 'string' && valor.length < min) {
            errores.push(`El campo '${campo}' debe tener al menos ${min} caracteres.`);
          } else if (typeof valor === 'number' && valor < min) {
             errores.push(`El campo '${campo}' debe ser como mínimo ${min}.`);
          }
          break;
        case 'max':
          const max = parseInt(arg, 10);
          if (typeof valor === 'string' && valor.length > max) {
            errores.push(`El campo '${campo}' no debe tener más de ${max} caracteres.`);
          } else if (typeof valor === 'number' && valor > max) {
             errores.push(`El campo '${campo}' no debe ser mayor a ${max}.`);
          }
          break;
        case 'in':
            const opciones = arg.split(',');
            if (!opciones.includes(String(valor))) {
                errores.push(`El campo '${campo}' debe ser uno de los siguientes valores: ${opciones.join(', ')}.`);
            }
            break;
      }
    }
  }
  return errores;
};

/**
 * Factory que crea un middleware de validación basado en un esquema.
 * El esquema define qué campos validar en `req.body`, `req.params` y `req.query`.
 * @param {object} esquema - El esquema de validación.
 * @returns {Function} Un middleware de Express.
 */
const validar = (esquema) => {
  return (req, res, next) => {
    let todosLosErrores = [];

    if (esquema.body) {
      todosLosErrores = todosLosErrores.concat(ejecutarValidacion(req.body, esquema.body));
    }
    if (esquema.params) {
      todosLosErrores = todosLosErrores.concat(ejecutarValidacion(req.params, esquema.params));
    }
    if (esquema.query) {
      todosLosErrores = todosLosErrores.concat(ejecutarValidacion(req.query, esquema.query));
    }

    if (todosLosErrores.length > 0) {
      // Si hay errores, se pasa a a través de `next` para que lo capture el `manejadorDeErrores`.
      return next(new ErrorValidacion('La solicitud contiene datos inválidos.', todosLosErrores));
    }
    
    // Si no hay errores, se continúa con el siguiente middleware.
    next();
  };
};

// --- ESQUEMAS DE VALIDACIÓN PREDEFINIDOS ---
// Se pueden definir aquí para reutilizarlos en las rutas.

const esquemaRegistroUsuario = {
  body: {
    nombres: 'required|string|min:2',
    apellidos: 'string|min:2',
    usuario: 'required|string|min:4',
    correoElectronico: 'required|email',
    contrasena: 'required|string|min:6'
  }
};

const esquemaLogin = {
    body: {
        identificador: 'required|string',
        contrasena: 'required|string'
    }
};

const esquemaCreacionProducto = {
    body: {
        codigoReferencia: 'required|string',
        nombreProducto: 'required|string|min:3',
        idCategoria: 'required|numeric',
        precioVentaSugerido: 'numeric'
    }
};

const esquemaIdEnUrl = {
    params: {
        id: 'required|numeric'
    }
};

/**
 * Middleware para procesar los resultados de express-validator.
 * Si hay errores, lanza una excepción de validación.
 */
const validarResultados = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new ErrorValidacion('Datos inválidos en la solicitud', errorMessages));
  }
  next();
};


module.exports = {
  validar,
  validarResultados,
  // Exportar esquemas predefinidos para usarlos en los archivos de rutas
  esquemas: {
      registroUsuario: esquemaRegistroUsuario,
      login: esquemaLogin,
      creacionProducto: esquemaCreacionProducto,
      idEnUrl: esquemaIdEnUrl
  }
};
