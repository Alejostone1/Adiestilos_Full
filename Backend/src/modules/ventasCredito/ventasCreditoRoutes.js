const express = require('express');
const router = express.Router();
const ventasCreditoController = require('./ventasCreditoController');
const { verificarTokenMiddleware, verificarRol } = require('../../middleware/authMiddleware');

/**
 * @route GET /api/ventas-credito
 * @desc Obtener listado de créditos
 */
router.get('/', [verificarTokenMiddleware, verificarRol('Administrador')], ventasCreditoController.listarCreditos);

/**
 * @route POST /api/ventas-credito/:idVenta/abono
 * @desc Registrar abono a un crédito
 */
router.post('/:idVenta/abono', [verificarTokenMiddleware], ventasCreditoController.abonarCredito);

module.exports = router;
