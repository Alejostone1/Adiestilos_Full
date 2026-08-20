/**
 * Controlador para Estados de Pedido.
 */

// --- IMPORTACIONES ---
const estadosPedidoService = require('./estadosPedidoService');
const { respuestaExitosa, respuestaCreada } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

const obtenerTodosEstadosPedido = capturarErroresAsync(async (req, res) => {
  const estados = await estadosPedidoService.obtenerTodos();
  res.status(200).json(respuestaExitosa(estados));
});

const crearEstadoPedido = capturarErroresAsync(async (req, res) => {
  const nuevoEstado = await estadosPedidoService.crear(req.body);
  res.status(201).json(respuestaCreada(nuevoEstado));
});

const actualizarEstadoPedido = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const estadoActualizado = await estadosPedidoService.actualizar(id, req.body);
  res.status(200).json(respuestaExitosa(estadoActualizado));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodosEstadosPedido,
  crearEstadoPedido,
  actualizarEstadoPedido
};
