/**
 * Controlador para Ajustes de Inventario.
 */

const { sendSuccess, respuestaError } = require('../../utils/responseHelper');
const {
  crearAjusteBorrador,
  aplicarAjuste,
  cancelarAjuste,
  obtenerAjustes,
  obtenerAjustePorId,
} = require('./ajustesInventarioService');

/**
 * Crear un ajuste de inventario en estado borrador.
 */
async function crearAjusteBorradorController(req, res) {
  try {
    const { idTipoMovimiento, motivo, detalleAjustes } = req.body;
    const usuarioRegistro = req.usuario.idUsuario; // Asumiendo que el middleware de auth agrega req.usuario

    const ajuste = await crearAjusteBorrador({
      idTipoMovimiento,
      motivo,
      detalleAjustes,
      usuarioRegistro,
    });

    sendSuccess(res, ajuste, 'Ajuste de inventario creado en borrador exitosamente', 201);
  } catch (error) {
    res.status(error.statusCode || 400).json(respuestaError(error.message, error.statusCode || 400, error.errores));
  }
}

/**
 * Aplicar un ajuste de inventario.
 */
async function aplicarAjusteController(req, res) {
  try {
    const { id } = req.params;
    const usuarioRegistro = req.usuario.idUsuario;

    const ajusteAplicado = await aplicarAjuste(Number(id), usuarioRegistro);

    sendSuccess(res, ajusteAplicado, 'Ajuste de inventario aplicado exitosamente');
  } catch (error) {
    console.error(`[ERROR Aplicar Ajuste] ID: ${req.params.id}:`, error);
    res.status(error.statusCode || 400).json(respuestaError(error.message, error.statusCode || 400, error.errores));
  }
}

/**
 * Cancelar un ajuste de inventario.
 */
async function cancelarAjusteController(req, res) {
  try {
    const { id } = req.params;

    const ajusteCancelado = await cancelarAjuste(Number(id));

    sendSuccess(res, ajusteCancelado, 'Ajuste de inventario cancelado exitosamente');
  } catch (error) {
    res.status(error.statusCode || 400).json(respuestaError(error.message, error.statusCode || 400, error.errores));
  }
}

/**
 * Obtener ajustes de inventario con filtros y paginación.
 */
async function obtenerAjustesController(req, res) {
  try {
    const { pagina = 1, limite = 10, estado, idTipoMovimiento, fechaInicio, fechaFin } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (idTipoMovimiento) filtros.idTipoMovimiento = Number(idTipoMovimiento);
    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;

    const resultado = await obtenerAjustes(filtros, {
      pagina: Number(pagina),
      limite: Number(limite),
    });

    sendSuccess(res, resultado, 'Ajustes de inventario obtenidos exitosamente');
  } catch (error) {
    res.status(500).json(respuestaError(error.message, 500));
  }
}

/**
 * Obtener un ajuste específico por ID.
 */
async function obtenerAjusteController(req, res) {
  try {
    const { id } = req.params;

    const ajuste = await obtenerAjustePorId(Number(id));

    sendSuccess(res, ajuste, 'Ajuste de inventario obtenido exitosamente');
  } catch (error) {
    res.status(404).json(respuestaError(error.message, 404));
  }
}

module.exports = {
  crearAjusteBorradorController,
  aplicarAjusteController,
  cancelarAjusteController,
  obtenerAjustesController,
  obtenerAjusteController,
};
