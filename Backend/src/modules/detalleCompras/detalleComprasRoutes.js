
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validationHelper');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware'); // Asumiendo middlewares

const {
  crearDetalleCompra,
  obtenerDetallesPorCompra,
  obtenerDetalleCompra,
} = require('./detalleComprasController');

/**
 * @swagger
 * /api/detalles-compra:
 *   post:
 *     summary: Crea un nuevo detalle para una orden de compra.
 *     description: Añade un producto (variante) a una compra existente, actualiza el stock y los totales de la compra.
 *     tags: [DetalleCompras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idCompra:
 *                 type: integer
 *               idVariante:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               precioUnitario:
 *                 type: number
 *               descuentoLinea:
 *                 type: number
 *     responses:
 *       201:
 *         description: Detalle de compra creado y stock actualizado.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: No autorizado.
 */
router.post(
  '/',
  [
    authMiddleware, // O [authMiddleware, adminMiddleware] si solo los admins pueden registrar compras
    body('idCompra').isInt({ gt: 0 }).withMessage('El ID de la compra es inválido.'),
    body('idVariante').isInt({ gt: 0 }).withMessage('El ID de la variante es inválido.'),
    body('cantidad').isFloat({ gt: 0 }).withMessage('La cantidad debe ser un número positivo.'),
    body('precioUnitario').isFloat({ gt: 0 }).withMessage('El precio unitario debe ser un número positivo.'),
    body('descuentoLinea').optional().isFloat({ min: 0 }).withMessage('El descuento no puede ser negativo.'),
    handleValidationErrors,
  ],
  crearDetalleCompra
);

/**
 * @swagger
 * /api/detalles-compra/compra/{idCompra}:
 *   get:
 *     summary: Obtiene todos los detalles de una compra específica.
 *     tags: [DetalleCompras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCompra
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de detalles de la compra.
 */
router.get(
  '/compra/:idCompra',
  [
    authMiddleware,
    param('idCompra').isInt({ gt: 0 }).withMessage('El ID de la compra debe ser un entero válido.'),
    handleValidationErrors,
  ],
  obtenerDetallesPorCompra
);

/**
 * @swagger
 * /api/detalles-compra/{id}:
 *   get:
 *     summary: Obtiene un detalle de compra por su ID.
 *     tags: [DetalleCompras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de compra encontrado.
 *       404:
 *         description: Detalle de compra no encontrado.
 */
router.get(
  '/:id',
  [
    authMiddleware,
    param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero válido.'),
    handleValidationErrors,
  ],
  obtenerDetalleCompra
);

module.exports = router;
