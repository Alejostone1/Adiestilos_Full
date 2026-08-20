/**
 * Controlador para Métodos de Pago.
 */

// --- IMPORTACIONES ---
const metodosPagoService = require('./metodosPagoService');
const { respuestaExitosa, respuestaCreada } = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

const obtenerMetodosPago = capturarErroresAsync(async (req, res) => {
  const metodos = await metodosPagoService.obtenerTodos();
  res.status(200).json(respuestaExitosa(metodos));
});

const obtenerMetodoPagoPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const metodo = await metodosPagoService.obtenerPorId(id);
  res.status(200).json(respuestaExitosa(metodo));
});

const crearMetodoPago = capturarErroresAsync(async (req, res) => {
  const nuevoMetodo = await metodosPagoService.crear(req.body);
  res.status(201).json(respuestaCreada(nuevoMetodo));
});

const actualizarMetodoPago = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const metodoActualizado = await metodosPagoService.actualizar(id, req.body);
  res.status(200).json(respuestaExitosa(metodoActualizado));
});

const eliminarMetodoPago = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  await metodosPagoService.eliminar(id);
  res.status(200).json(respuestaExitosa(null, 'Método de pago eliminado correctamente.'));
});

const obtenerTiposMetodoPago = capturarErroresAsync(async (req, res) => {
  const tipos = await metodosPagoService.obtenerTipos();
  res.status(200).json(respuestaExitosa(tipos));
});

// --- EXPORTACIÓN ---
module.exports = {
  obtenerMetodosPago,
  obtenerMetodoPagoPorId,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
  obtenerTiposMetodoPago
};
