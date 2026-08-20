
const express = require('express');
const router = express.Router();
const {
  obtenerTodosEstadosPedido,
  crearEstadoPedido,
  actualizarEstadoPedido,
} = require('./estadosPedidoController');
const { verificarTokenMiddleware, rutaAdministrador } = require('../../middleware/authMiddleware');

// Rutas para los estados de pedido

// Obtener todos los estados de pedido (protegido)
router.get('/', verificarTokenMiddleware, obtenerTodosEstadosPedido);

// Crear un nuevo estado de pedido (solo administradores)
router.post('/', rutaAdministrador(), crearEstadoPedido);

// Actualizar un estado de pedido (solo administradores)
router.put('/:id', rutaAdministrador(), actualizarEstadoPedido);

module.exports = router;
