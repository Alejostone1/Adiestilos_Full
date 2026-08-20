
const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validationHelper');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

const {
  obtenerResumenCrediticio,
  listarClientesConSaldos,
  obtenerLimiteDisponible,
} = require('./clientesCreditoResumenController');


/**
 * @swagger
 * /api/resumen-credito/clientes-con-saldo:
 *   get:
 *     summary: Lista los clientes que tienen un saldo de crédito pendiente.
 *     tags: [ResumenCredito]
 *     security:
 *       - bearerAuth: [admin]
 *     responses:
 *       200:
 *         description: Lista de clientes con saldos pendientes.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Acceso denegado (no es admin).
 */
router.get(
    '/clientes-con-saldo',
    [authMiddleware, adminMiddleware],
    listarClientesConSaldos
);

/**
 * @swagger
 * /api/resumen-credito/{idUsuario}:
 *   get:
 *     summary: Obtiene el resumen de crédito para un cliente específico.
 *     tags: [ResumenCredito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del usuario (cliente).
 *     responses:
 *       200:
 *         description: Resumen crediticio del cliente.
 *       404:
 *         description: Cliente no encontrado o sin resumen.
 */
router.get(
  '/:idUsuario',
  [
    authMiddleware, // Un usuario puede ver su propio resumen, o un admin puede ver cualquiera
    param('idUsuario').isInt({ gt: 0 }).withMessage('El ID de usuario debe ser un entero válido.'),
    handleValidationErrors,
  ],
  obtenerResumenCrediticio
);


/**
 * @swagger
 * /api/resumen-credito/{idUsuario}/limite-disponible:
 *   get:
 *     summary: Obtiene el límite de crédito disponible para un cliente.
 *     tags: [ResumenCredito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del usuario (cliente).
 *     responses:
 *       200:
 *         description: Límite de crédito disponible.
 */
router.get(
    '/:idUsuario/limite-disponible',
    [
      authMiddleware,
      param('idUsuario').isInt({ gt: 0 }).withMessage('El ID de usuario debe ser un entero válido.'),
      handleValidationErrors,
    ],
    obtenerLimiteDisponible
  );


module.exports = router;
