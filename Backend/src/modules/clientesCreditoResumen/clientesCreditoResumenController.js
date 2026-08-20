
const resumenService = require('./clientesCreditoResumenService');
const { response, request } = require('express');

/**
 * Controlador para obtener el resumen crediticio de un cliente específico.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const obtenerResumenCrediticio = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const resumen = await resumenService.obtenerResumenCrediticio(idUsuario);
    res.status(200).json({ ok: true, resumen });
  } catch (error) {
    console.error('Error en obtenerResumenCrediticio controller:', error);
    res.status(404).json({ ok: false, msg: error.message || 'No se pudo obtener el resumen del cliente.' });
  }
};

/**
 * Controlador para listar todos los clientes con saldos pendientes.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const listarClientesConSaldos = async (req, res) => {
  try {
    const clientes = await resumenService.listarClientesConSaldos();
    res.status(200).json({ ok: true, clientes });
  } catch (error) {
    console.error('Error en listarClientesConSaldos controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al listar clientes con saldos.' });
  }
};

/**
 * Controlador para consultar el límite de crédito disponible de un cliente.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const obtenerLimiteDisponible = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const disponible = await resumenService.obtenerLimiteDeCreditoDisponible(idUsuario);
        res.status(200).json({ ok: true, limiteDisponible: disponible });
    } catch (error) {
        console.error('Error en obtenerLimiteDisponible controller:', error);
        res.status(404).json({ ok: false, msg: error.message || 'No se pudo calcular el límite disponible.' });
    }
}

module.exports = {
  obtenerResumenCrediticio,
  listarClientesConSaldos,
  obtenerLimiteDisponible,
};
