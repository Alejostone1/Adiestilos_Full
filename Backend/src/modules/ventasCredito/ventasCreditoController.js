const ventasCreditoService = require('./ventasCreditoService');

/**
 * Obtiene el listado de créditos paginado.
 */
async function listarCreditos(req, res) {
    try {
        const { page = 1, limit = 10, estado, idUsuario } = req.query;
        
        const filtros = {};
        if (estado) filtros.estado = estado;
        if (idUsuario) filtros.idUsuario = parseInt(idUsuario);

        const resultado = await ventasCreditoService.obtenerCreditos(filtros, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            exito: true,
            datos: resultado.creditos,
            paginacion: {
                total: resultado.total,
                paginas: resultado.paginas,
                paginaActual: resultado.paginaActual
            }
        });
    } catch (error) {
        console.error('Error en listarCreditos:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener los créditos'
        });
    }
}

/**
 * Registra un nuevo abono a una venta/crédito.
 */
async function abonarCredito(req, res) {
    try {
        const { idVenta } = req.params;
        const { monto, idMetodoPago, notas } = req.body;
        const usuarioRegistro = req.usuario.idUsuario;

        if (!monto || monto <= 0) {
            return res.status(400).json({ exito: false, mensaje: 'Monto de abono inválido' });
        }

        const resultado = await ventasCreditoService.registrarAbono(parseInt(idVenta), {
            monto: parseFloat(monto),
            idMetodoPago: parseInt(idMetodoPago),
            usuarioRegistro,
            notas
        });

        res.json({
            exito: true,
            mensaje: 'Abono registrado correctamente',
            nuevoSaldo: resultado.nuevoSaldo
        });
    } catch (error) {
        console.error('Error en abonarCredito:', error);
        res.status(400).json({
            exito: false,
            mensaje: error.message || 'Error al registrar el abono'
        });
    }
}

module.exports = {
    listarCreditos,
    abonarCredito
};
