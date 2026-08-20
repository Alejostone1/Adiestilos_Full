/**
 * Controlador para la gestión de Créditos.
 * Maneja las solicitudes HTTP y las respuestas para las operaciones de créditos.
 */

// --- IMPORTACIONES ---
const creditosService = require('./creditosService');
const {
  respuestaExitosa,
  respuestaPaginada
} = require('../../utils/responseHelper');
const { capturarErroresAsync } = require('../../utils/errorHelper');

// --- CONTROLADORES ---

/**
 * Controlador para obtener todos los créditos.
 * @route GET /api/creditos
 */
const obtenerTodosLosCreditos = capturarErroresAsync(async (req, res) => {
  const { pagina = 1, limite = 10, ...filtros } = req.query;
  const resultado = await creditosService.obtenerTodos(filtros, { pagina, limite });

  res.status(200).json(respuestaPaginada(
    resultado.datos,
    resultado.paginacion,
    'Créditos obtenidos exitosamente.'
  ));
});

/**
 * Controlador para obtener un crédito por su ID.
 * @route GET /api/creditos/:id
 */
const obtenerCreditoPorId = capturarErroresAsync(async (req, res) => {
  const { id } = req.params;
  const credito = await creditosService.obtenerPorId(id, req.usuario);
  res.status(200).json(respuestaExitosa(credito));
});

/**
 * Controlador para obtener los créditos de un cliente específico.
 * @route GET /api/creditos/cliente/:idUsuario
 */
const obtenerCreditosPorCliente = capturarErroresAsync(async (req, res) => {
  const { idUsuario } = req.params;
  const creditos = await creditosService.obtenerPorCliente(idUsuario, req.usuario);
  res.status(200).json(respuestaExitosa(creditos));
});

/**
 * Controlador para agregar un abono a un crédito.
 * @route POST /api/creditos/:id/abonos
 */
const agregarAbono = capturarErroresAsync(async (req, res) => {
    const { id } = req.params;
    const datosAbono = req.body; // { monto, idMetodoPago }
    datosAbono.usuarioRegistro = req.usuario.idUsuario;

    const creditoActualizado = await creditosService.agregarAbono(id, datosAbono);
    res.status(200).json(respuestaExitosa(creditoActualizado, 'Abono registrado exitosamente.'));
});


// --- EXPORTACIÓN ---
module.exports = {
  obtenerTodosLosCreditos,
  obtenerCreditoPorId,
  obtenerCreditosPorCliente,
  agregarAbono
};
