const { body } = require('express-validator');
const { validarResultados } = require('../../middleware/validationMiddleware');

/**
 * Validaciones para crear una nueva orden de compra
 */
const validarCreacionCompra = [
  body('idProveedor')
    .notEmpty().withMessage('El proveedor es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número entero válido'),
  
  body('fechaCompra')
    .notEmpty().withMessage('La fecha de compra es obligatoria')
    .isISO8601().toDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),
  
  body('detalleCompras')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto en el detalle de la compra'),
  
  body('detalleCompras.*.idVariante')
    .notEmpty().withMessage('El ID de la variante es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la variante debe ser un número entero válido'),
  
  body('detalleCompras.*.cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria')
    .isFloat({ min: 0.01 }).withMessage('La cantidad debe ser mayor a 0'),
  
  body('detalleCompras.*.precioUnitario')
    .notEmpty().withMessage('El precio unitario es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio unitario no puede ser negativo'),

  validarResultados
];

/**
 * Validaciones para recibir una compra (total o parcial)
 */
const validarRecepcionCompra = [
  body('detallesRecibidos')
    .optional()
    .isArray().withMessage('Los detalles recibidos deben ser un arreglo'),
  
  body('detallesRecibidos.*.idDetalleCompra')
    .if(body('detallesRecibidos').exists())
    .notEmpty().withMessage('El ID del detalle de compra es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del detalle debe ser un número entero válido'),
  
  body('detallesRecibidos.*.cantidad')
    .if(body('detallesRecibidos').exists())
    .notEmpty().withMessage('La cantidad recibida es obligatoria')
    .isFloat({ min: 0.01 }).withMessage('La cantidad recibida debe ser mayor a 0'),

  validarResultados
];

module.exports = {
  validarCreacionCompra,
  validarRecepcionCompra
};
