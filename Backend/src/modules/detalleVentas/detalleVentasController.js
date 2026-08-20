
const detalleVentasService = require('./detalleVentasService');
const { response, request } = require('express');
const { matchedData } = require('express-validator');

/**
 * Controlador para obtener los detalles de una venta específica.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const obtenerDetallesPorVenta = async (req, res) => {
  try {
    const { idVenta } = req.params;
    const detalles = await detalleVentasService.obtenerDetallesPorVentaId(idVenta);
    res.status(200).json({ ok: true, detalles });
  } catch (error) {
    console.error('Error en obtenerDetallesPorVenta controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al obtener los detalles de la venta.' });
  }
};

/**
 * Controlador para obtener un detalle de venta por su ID.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await detalleVentasService.obtenerDetalleVentaPorId(id);
    res.status(200).json({ ok: true, detalle });
  } catch (error) {
    console.error('Error en obtenerDetalleVenta controller:', error);
    res.status(404).json({ ok: false, msg: error.message || 'Detalle de venta no encontrado.' });
  }
};

/**
 * Controlador para crear un nuevo detalle de venta.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const crearDetalleVenta = async (req, res) => {
  try {
    // Asumimos que la validación y limpieza de datos ya se hizo con express-validator
    // const data = matchedData(req);
    const data = req.body; 

    // El ID del usuario se debe adjuntar desde el middleware de autenticación
    const idUsuario = req.usuario.id_usuario; 

    if (!idUsuario) {
      return res.status(401).json({ ok: false, msg: 'No autorizado. Se requiere ID de usuario.' });
    }

    const nuevoDetalle = await detalleVentasService.crearDetalleVenta(data, idUsuario);
    
    res.status(201).json({
      ok: true,
      msg: 'Detalle de venta creado y el inventario ha sido actualizado exitosamente.',
      detalle: nuevoDetalle,
    });
  } catch (error) {
    console.error('Error en crearDetalleVenta controller:', error);
    res.status(400).json({ ok: false, msg: error.message || 'No se pudo crear el detalle de la venta.' });
  }
};

// NOTA: La actualización y eliminación de un detalle de venta es compleja y peligrosa.
// Generalmente, no se elimina un detalle, sino que se crea una "devolución" para revertir la operación.
// Por esta razón, no se implementan los controladores de `actualizar` y `eliminar` directamente.
// Esta lógica de negocio pertenece al módulo de Devoluciones.

module.exports = {
  obtenerDetallesPorVenta,
  obtenerDetalleVenta,
  crearDetalleVenta,
};
