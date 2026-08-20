/**
 * Funciones auxiliares para validaciones en el frontend.
 * Estas validaciones son para mejorar la experiencia de usuario (UX) y no reemplazan
 * las validaciones del backend. Se enfocan en feedback inmediato y básico.
 */

import { VALIDACION } from './constants';

/**
 * Valida si un campo es requerido (no vacío).
 * @param {any} valor - El valor a validar.
 * @param {string} nombreCampo - El nombre del campo para el mensaje de error.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarRequerido = (valor, nombreCampo) => {
  if (valor === null || valor === undefined || valor === '' || (Array.isArray(valor) && valor.length === 0)) {
    return `El campo ${nombreCampo} es obligatorio.`;
  }
  return null;
};

/**
 * Valida el formato de un correo electrónico.
 * @param {string} email - El correo electrónico a validar.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarEmail = (email) => {
  if (!email) return null; // Si está vacío, dejar que validarRequerido lo maneje

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El formato del correo electrónico no es válido.';
  }
  return null;
};

/**
 * Valida la longitud mínima de un texto.
 * @param {string} texto - El texto a validar.
 * @param {number} longitudMinima - La longitud mínima requerida.
 * @param {string} nombreCampo - El nombre del campo para el mensaje de error.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarLongitudMinima = (texto, longitudMinima, nombreCampo) => {
  if (!texto) return null; // Si está vacío, dejar que validarRequerido lo maneje

  if (texto.length < longitudMinima) {
    return `El campo ${nombreCampo} debe tener al menos ${longitudMinima} caracteres.`;
  }
  return null;
};

/**
 * Valida la longitud máxima de un texto.
 * @param {string} texto - El texto a validar.
 * @param {number} longitudMaxima - La longitud máxima permitida.
 * @param {string} nombreCampo - El nombre del campo para el mensaje de error.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarLongitudMaxima = (texto, longitudMaxima, nombreCampo) => {
  if (!texto) return null;

  if (texto.length > longitudMaxima) {
    return `El campo ${nombreCampo} no debe tener más de ${longitudMaxima} caracteres.`;
  }
  return null;
};

/**
 * Valida que un valor sea numérico.
 * @param {any} valor - El valor a validar.
 * @param {string} nombreCampo - El nombre del campo para el mensaje de error.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarNumerico = (valor, nombreCampo) => {
  if (valor === null || valor === undefined || valor === '') return null;

  if (isNaN(parseFloat(valor)) || !isFinite(valor)) {
    return `El campo ${nombreCampo} debe ser un número válido.`;
  }
  return null;
};

/**
 * Valida que un número sea positivo.
 * @param {number} numero - El número a validar.
 * @param {string} nombreCampo - El nombre del campo para el mensaje de error.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarPositivo = (numero, nombreCampo) => {
  if (numero === null || numero === undefined || numero === '') return null;

  const num = parseFloat(numero);
  if (isNaN(num) || num <= 0) {
    return `El campo ${nombreCampo} debe ser un número positivo.`;
  }
  return null;
};

/**
 * Valida una contraseña básica (longitud mínima).
 * @param {string} contrasena - La contraseña a validar.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validarContrasena = (contrasena) => {
  if (!contrasena) return null;

  if (contrasena.length < VALIDACION.MIN_CONTRASENA) {
    return `La contraseña debe tener al menos ${VALIDACION.MIN_CONTRASENA} caracteres.`;
  }
  return null;
};

/**
 * Valida que dos contraseñas coincidan.
 * @param {string} contrasena - La contraseña original.
 * @param {string} confirmarContrasena - La confirmación de la contraseña.
 * @returns {string|null} Mensaje de error o null si coinciden.
 */
export const validarConfirmacionContrasena = (contrasena, confirmarContrasena) => {
  if (!contrasena || !confirmarContrasena) return null;

  if (contrasena !== confirmarContrasena) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
};

/**
 * Ejecuta múltiples validaciones y devuelve el primer error encontrado.
 * @param {Array<Function>} validaciones - Array de funciones de validación.
 * @returns {string|null} El primer mensaje de error o null si todas pasan.
 */
export const ejecutarValidaciones = (...validaciones) => {
  for (const validacion of validaciones) {
    const error = validacion();
    if (error) return error;
  }
  return null;
};

/**
 * Valida un formulario completo y devuelve un objeto con errores por campo.
 * @param {object} datos - Los datos del formulario.
 * @param {object} reglas - Las reglas de validación por campo.
 * @returns {object} Objeto con errores por campo (vacío si no hay errores).
 */
export const validarFormulario = (datos, reglas) => {
  const errores = {};

  for (const campo in reglas) {
    const valor = datos[campo];
    const reglasCampo = reglas[campo];

    for (const regla of reglasCampo) {
      let error = null;

      switch (regla) {
        case 'requerido':
          error = validarRequerido(valor, campo);
          break;
        case 'email':
          error = validarEmail(valor);
          break;
        case 'numerico':
          error = validarNumerico(valor, campo);
          break;
        case 'positivo':
          error = validarPositivo(valor, campo);
          break;
        case 'contrasena':
          error = validarContrasena(valor);
          break;
        default:
          // Para reglas con parámetros como 'min:6'
          if (regla.startsWith('min:')) {
            const min = parseInt(regla.split(':')[1], 10);
            error = validarLongitudMinima(valor, min, campo);
          } else if (regla.startsWith('max:')) {
            const max = parseInt(regla.split(':')[1], 10);
            error = validarLongitudMaxima(valor, max, campo);
          }
          break;
      }

      if (error) {
        errores[campo] = error;
        break; // Solo el primer error por campo
      }
    }
  }

  return errores;
};
