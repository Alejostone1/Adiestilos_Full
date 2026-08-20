
const detalleComprasService = require('./detalleComprasService');
const { response, request } = require('express');

/**
 * Controlador para obtener los detalles de una compra específica.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const obtenerDetallesPorCompra = async (req, res) => {
  try {
    const { idCompra } = req.params;
    const detalles = await detalleComprasService.obtenerDetallesPorCompraId(idCompra);
    res.status(200).json({ ok: true, detalles });
  } catch (error) {
    console.error('Error en obtenerDetallesPorCompra controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al obtener los detalles de la compra.' });
  }
};

/**
 * Controlador para obtener un detalle de compra por su ID.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const obtenerDetalleCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await detalleComprasService.obtenerDetalleCompraPorId(id);
    res.status(200).json({ ok: true, detalle });
  } catch (error) {
    console.error('Error en obtenerDetalleCompra controller:', error);
    res.status(404).json({ ok: false, msg: error.message || 'Detalle de compra no encontrado.' });
  }
};

/**
 * Controlador para crear un nuevo detalle de compra.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const crearDetalleCompra = async (req, res) => {
  try {
    const data = req.body; 

    // El ID del usuario se debe adjuntar desde el middleware de autenticación
    const idUsuario = req.usuario.id_usuario; 

    if (!idUsuario) {
      return res.status(401).json({ ok: false, msg: 'No autorizado. Se requiere ID de usuario.' });
    }

    const nuevoDetalle = await detalleComprasService.crearDetalleCompra(data, idUsuario);
    
    res.status(201).json({
      ok: true,
      msg: 'Detalle de compra creado y el inventario ha sido actualizado exitosamente.',
      detalle: nuevoDetalle,
    });
  } catch (error) {
    console.error('Error en crearDetalleCompra controller:', error);
    res.status(400).json({ ok: false, msg: error.message || 'No se pudo crear el detalle de la compra.' });
  }
};

// NOTA: Al igual que con las ventas, la modificación o eliminación de un detalle de compra
// es una operación delicada. Generalmente, se maneja a través de "Devoluciones de Compra"
// o ajustes de inventario, en lugar de una eliminación directa, para mantener la trazabilidad.

module.exports = {
  obtenerDetallesPorCompra,
  obtenerDetalleCompra,
  crearDetalleCompra,
};
