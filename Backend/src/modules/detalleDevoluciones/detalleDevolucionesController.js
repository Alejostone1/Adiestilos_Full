
const devolucionesService = require('./detalleDevolucionesService');
const { response, request } = require('express');

/**
 * Controlador para crear una nueva solicitud de devolución.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const crearDevolucion = async (req, res) => {
  try {
    // El ID de usuario que registra la devolución viene del token de autenticación
    const idUsuarioRegistro = req.usuario.id_usuario; 
    const data = { ...req.body, usuarioRegistro: idUsuarioRegistro };

    const nuevaDevolucion = await devolucionesService.crearDevolucion(data);
    res.status(201).json({
      ok: true,
      msg: 'Solicitud de devolución creada exitosamente. Queda en estado pendiente.',
      devolucion: nuevaDevolucion,
    });
  } catch (error) {
    console.error('Error en crearDevolucion controller:', error);
    res.status(400).json({ ok: false, msg: error.message || 'No se pudo crear la solicitud de devolución.' });
  }
};

/**
 * Controlador para cambiar el estado de una devolución (ej. aprobar, rechazar).
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const cambiarEstadoDevolucion = async (req, res) => {
    try {
      const { idDevolucion } = req.params;
      const { estado } = req.body;
  
      if (!estado) {
        return res.status(400).json({ ok: false, msg: 'El nuevo estado es requerido.' });
      }
  
      const devolucionActualizada = await devolucionesService.cambiarEstadoDevolucion(Number(idDevolucion), estado);
      res.status(200).json({
        ok: true,
        msg: `La devolución ha sido actualizada al estado: ${estado}.`,
        devolucion: devolucionActualizada,
      });
    } catch (error) {
      console.error('Error en cambiarEstadoDevolucion controller:', error);
      res.status(400).json({ ok: false, msg: error.message || 'No se pudo cambiar el estado de la devolución.' });
    }
};

/**
 * Controlador para procesar una devolución que ya ha sido aprobada.
 * @param {request} req - Objeto de solicitud de Express.
 * @param {response} res - Objeto de respuesta de Express.
 */
const procesarDevolucion = async (req, res) => {
    try {
        const { idDevolucion } = req.params;
        const idUsuarioRegistro = req.usuario.id_usuario; // El admin/usuario que procesa

        const devolucionProcesada = await devolucionesService.procesarDevolucion(Number(idDevolucion), idUsuarioRegistro);
        res.status(200).json({
            ok: true,
            msg: 'La devolución ha sido procesada exitosamente: el inventario y las finanzas han sido actualizados.',
            devolucion: devolucionProcesada,
        });
    } catch (error) {
        console.error('Error en procesarDevolucion controller:', error);
        res.status(400).json({ ok: false, msg: error.message || 'Ocurrió un error al procesar la devolución.' });
    }
};


// Aquí se podrían añadir controladores para consultar devoluciones si fuera necesario.

module.exports = {
  crearDevolucion,
  cambiarEstadoDevolucion,
  procesarDevolucion,
};
