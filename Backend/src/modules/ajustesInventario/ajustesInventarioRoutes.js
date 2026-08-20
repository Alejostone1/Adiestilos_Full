/**
 * Rutas para Ajustes de Inventario.
 * Implementa el flujo completo: borrador → aplicado
 */

const express = require('express');
const router = express.Router();
const { rutaAdministrador } = require('../../middleware/authMiddleware');
const {
  crearAjusteBorradorController,
  aplicarAjusteController,
  cancelarAjusteController,
  obtenerAjustesController,
  obtenerAjusteController,
} = require('./ajustesInventarioController');

// Rutas para ajustes de inventario
router.post('/borrador', rutaAdministrador(), crearAjusteBorradorController);
router.patch('/:id/aplicar', rutaAdministrador(), aplicarAjusteController);
router.patch('/:id/cancelar', rutaAdministrador(), cancelarAjusteController);
router.get('/', rutaAdministrador(), obtenerAjustesController);
router.get('/:id', rutaAdministrador(), obtenerAjusteController);

module.exports = router;
