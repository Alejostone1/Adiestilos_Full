
const descuentosService = require('./descuentosService');
const { response, request } = require('express');
const { matchedData } = require('express-validator');

/**
 * Controlador para crear un nuevo descuento.
 */
const crearDescuento = async (req, res) => {
  try {
    const data = matchedData(req);
    const idUsuario = req.usuario.idUsuario; // Asumido desde el middleware de autenticación

    const nuevoDescuento = await descuentosService.crearDescuento(data, idUsuario);
    res.status(201).json({
      ok: true,
      msg: 'Descuento creado exitosamente.',
      descuento: nuevoDescuento,
    });
  } catch (error) {
    console.error('Error en crearDescuento controller:', error);
    res.status(400).json({ ok: false, msg: error.message || 'No se pudo crear el descuento.' });
  }
};

/**
 * Controlador para obtener una lista paginada de descuentos.
 */
const obtenerDescuentos = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, tipoDescuento, aplicaA, buscar } = req.query;

    // Construir filtros
    const filters = {};
    if (estado) filters.estado = estado;
    if (tipoDescuento) filters.tipoDescuento = tipoDescuento;
    if (aplicaA) filters.aplicaA = aplicaA;
    if (buscar) {
      filters.OR = [
        { nombreDescuento: { contains: buscar } },
        { codigoDescuento: { contains: buscar } },
        { descripcion: { contains: buscar } }
      ];
    }

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const resultado = await descuentosService.obtenerDescuentos(filters, options);

    res.status(200).json({
      ok: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en obtenerDescuentos controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al obtener los descuentos.' });
  }
};

/**
 * Controlador para obtener un descuento por su ID.
 */
const obtenerDescuentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const descuento = await descuentosService.obtenerDescuentoPorId(id);
    res.status(200).json({ ok: true, descuento });
  } catch (error) {
    console.error('Error en obtenerDescuentoPorId controller:', error);
    res.status(404).json({ ok: false, msg: error.message || 'Descuento no encontrado.' });
  }
};

/**
 * Controlador para obtener un descuento por su código.
 */
const obtenerDescuentoPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const descuento = await descuentosService.obtenerDescuentoPorCodigo(codigo);
    res.status(200).json({ ok: true, descuento });
  } catch (error) {
    console.error('Error en obtenerDescuentoPorCodigo controller:', error);
    res.status(404).json({ ok: false, msg: error.message || 'Descuento no encontrado.' });
  }
};

/**
 * Controlador para actualizar un descuento existente.
 */
const actualizarDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const descuentoActualizado = await descuentosService.actualizarDescuento(id, data);
    res.status(200).json({
      ok: true,
      msg: 'Descuento actualizado exitosamente.',
      descuento: descuentoActualizado,
    });
  } catch (error) {
    console.error('Error en actualizarDescuento controller:', error);
    res.status(400).json({ ok: false, msg: error.message || 'No se pudo actualizar el descuento.' });
  }
};

/**
 * Controlador para eliminar (desactivar) un descuento.
 */
const eliminarDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const descuentoEliminado = await descuentosService.eliminarDescuento(id);
    res.status(200).json({
      ok: true,
      msg: 'Descuento eliminado exitosamente.',
      descuento: descuentoEliminado,
    });
  } catch (error) {
    console.error('Error en eliminarDescuento controller:', error);
    res.status(400).json({ ok: false, msg: error.message || 'No se pudo eliminar el descuento.' });
  }
};

/**
 * Controlador para actualizar el estado de un descuento.
 */
const actualizarEstadoDescuento = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const descuentoActualizado = await descuentosService.actualizarEstadoDescuento(id, estado);
        res.status(200).json({
            ok: true,
            msg: `Descuento actualizado al estado: ${estado}`,
            descuento: descuentoActualizado
        });
    } catch (error) {
        console.error('Error en actualizarEstadoDescuento controller:', error);
        res.status(400).json({ ok: false, msg: error.message || 'No se pudo actualizar el estado del descuento.' });
    }
};

/**
 * Controlador para validar si un código de descuento es aplicable.
 */
const validarDescuento = async (req, res) => {
    try {
        const { codigoDescuento, montoCompra } = req.body;
        const idUsuario = req.usuario.idUsuario;

        if (!codigoDescuento || montoCompra === undefined) {
            return res.status(400).json({ ok: false, msg: 'El código de descuento y el monto de la compra son requeridos.' });
        }

        const resultado = await descuentosService.validarAplicabilidadDescuento(codigoDescuento, idUsuario, Number(montoCompra));

        if (!resultado.valido) {
            return res.status(400).json({ ok: false, msg: resultado.mensaje, descuento: null });
        }

        res.status(200).json({ ok: true, ...resultado });

    } catch (error) {
        console.error('Error en validarDescuento controller:', error);
        res.status(500).json({ ok: false, msg: error.message || 'Error inesperado al validar el descuento.' });
    }
};

/**
 * Controlador para obtener el historial de un descuento específico.
 */
const obtenerHistorialDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const resultado = await descuentosService.obtenerHistorialDescuento(id, options);

    res.status(200).json({
      ok: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en obtenerHistorialDescuento controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al obtener el historial del descuento.' });
  }
};

/**
 * Controlador para obtener el historial general de descuentos.
 */
const obtenerHistorialGeneral = async (req, res) => {
  try {
    const { page = 1, limit = 10, idDescuento, idUsuario, fechaInicio, fechaFin } = req.query;

    // Construir filtros
    const filters = {};
    if (idDescuento) filters.idDescuento = parseInt(idDescuento);
    if (idUsuario) filters.idUsuario = parseInt(idUsuario);
    if (fechaInicio || fechaFin) {
      filters.fechaUso = {};
      if (fechaInicio) filters.fechaUso.gte = new Date(fechaInicio);
      if (fechaFin) filters.fechaUso.lte = new Date(fechaFin);
    }

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const resultado = await descuentosService.obtenerHistorialGeneral(filters, options);

    res.status(200).json({
      ok: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en obtenerHistorialGeneral controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al obtener el historial general.' });
  }
};

/**
 * Controlador para obtener estadísticas de descuentos.
 */
const obtenerEstadisticasDescuentos = async (req, res) => {
  try {
    const estadisticas = await descuentosService.obtenerEstadisticasDescuentos();
    res.status(200).json({
      ok: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasDescuentos controller:', error);
    res.status(500).json({ ok: false, msg: error.message || 'Error al obtener estadísticas.' });
  }
};

module.exports = {
  crearDescuento,
  obtenerDescuentos,
  obtenerDescuentoPorId,
  obtenerDescuentoPorCodigo,
  actualizarDescuento,
  eliminarDescuento,
  actualizarEstadoDescuento,
  validarDescuento,
  obtenerHistorialDescuento,
  obtenerHistorialGeneral,
  obtenerEstadisticasDescuentos,
};
