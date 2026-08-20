const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const errorHelper = require('../../utils/errorHelper');
const movimientosService = require('../movimientos/movimientosService');
const descuentosService = require('../descuentos/descuentosService');

const obtenerTodas = async (filtros, usuario, opciones = {}) => {
  try {
    const {
      busqueda = '',
      estadoPedido = '',
    } = filtros;

    const { pagina = 1, limite = 10 } = opciones;

    const offset = (pagina - 1) * limite;
    let where = {};

    if (busqueda) {
      where.OR = [
        { numeroFactura: { contains: busqueda } },
        {
          usuarioCliente: {
            nombres: { contains: busqueda },
          },
        },
        {
          usuarioCliente: {
            apellidos: { contains: busqueda },
          },
        },
      ];
    }

    if (estadoPedido) {
      where.estadoPedido = {
        nombreEstado: { equals: estadoPedido },
      };
    }

    const ventas = await prisma.venta.findMany({
      where,
      skip: offset,
      take: parseInt(limite, 10),
      include: {
        usuarioCliente: {
          select: {
            nombres: true,
            apellidos: true,
            usuario: true,
          },
        },
        estadoPedido: true,
        detalleVentas: {
          include: {
            variante: {
              include: {
                producto: {
                  include: {
                    imagenes: true
                  }
                },
                color: true,
                talla: true,
                imagenesVariantes: true
              }
            }
          }
        }
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    const total = await prisma.venta.count({ where });

    return {
      datos: ventas,
      paginacion: {
        totalRegistros: total,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(total / limite),
        registrosPorPagina: parseInt(limite, 10)
      },
    };
  } catch (error) {
    throw error;
  }
};

const obtenerPorId = async (id, usuario) => {
  try {
    const venta = await prisma.venta.findUnique({
      where: { idVenta: parseInt(id, 10) },
      include: {
        usuarioCliente: true,
        usuarioVendedor: true,
        estadoPedido: true,
        detalleVentas: {
          include: {
            variante: {
              include: {
                producto: {
                  include: {
                    imagenes: true
                  }
                },
                talla: true,
                color: true,
                imagenesVariantes: true
              },
            },
          },
        },
        pagos: {
          include: {
            metodoPago: true
          }
        },
        movimientos: true,
        credito: true,
      },
    });

    if (!venta) {
      throw errorHelper.crearError(404, 'Venta no encontrada');
    }

    if (
      usuario.rol.nombreRol === 'cliente' &&
      venta.idUsuarioCliente !== usuario.idUsuario
    ) {
      throw errorHelper.crearError(
        403,
        'Acceso denegado. No tienes permiso para ver esta venta.'
      );
    }

    return venta;
  } catch (error) {
    throw error;
  }
};

const crear = async (datosVenta, usuario) => {
  const {
    idUsuarioCliente,
    idUsuario,
    detalleVentas,
    subtotal = 0,
    impuestos = 0,
    total,
    descuentoTotal = 0,
    estadoPago = 'pendiente',
    tipoVenta = 'contado',
    idEstadoPedido,
    notas,
    direccionEntrega,
    idDescuento,
    codigoDescuentoUsado,
    pagos = [],
  } = datosVenta;

  const idUsuarioFinal = idUsuarioCliente || idUsuario;

  if (!idUsuarioFinal || !detalleVentas || detalleVentas.length === 0) {
    throw errorHelper.crearError('validacion', 'Faltan datos obligatorios para la venta.');
  }

  return await prisma.$transaction(async (tx) => {
    const numeroFactura = `FV-${Date.now()}`;
    const idEstadoPendiente = 1;

    const subtotalCalculado = detalleVentas.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precioUnitario = Number(item.precioUnitario) || 0;
      return acc + (cantidad * precioUnitario);
    }, 0);
    const totalPagado = pagos.reduce((acc, pago) => acc + (Number(pago.monto) || 0), 0);
    const subtotalFinal = subtotal || subtotalCalculado;
    const totalFinal = total ?? (subtotalFinal + Number(impuestos || 0) - Number(descuentoTotal || 0));
    const saldoPendiente = totalFinal - totalPagado;

    const nuevaVenta = await tx.venta.create({
      data: {
        numeroFactura,
        idUsuario: idUsuarioFinal,
        idUsuarioVendedor: usuario.idUsuario,
        idEstadoPedido: idEstadoPedido || idEstadoPendiente,
        subtotal: subtotalFinal,
        impuestos,
        descuentoTotal,
        total: totalFinal,
        saldoPendiente,
        totalPagado,
        estadoPago,
        tipoVenta,
        notas,
        direccionEntrega,
        idDescuento,
        codigoDescuentoUsado,
        detalleVentas: {
          create: detalleVentas.map((item) => ({
            idVariante: item.idVariante || item.idVarianteProducto,
            cantidad: Number(item.cantidad),
            precioUnitario: Number(item.precioUnitario),
            descuentoLinea: Number(item.descuentoLinea) || 0,
            subtotal: Number(item.subtotal) || (Number(item.cantidad) * Number(item.precioUnitario)),
            totalLinea: Number(item.totalLinea) || ((Number(item.cantidad) * Number(item.precioUnitario)) - (Number(item.descuentoLinea) || 0)),
          })),
        },
      },
      include: {
        detalleVentas: true,
      },
    });

    const tipoMovimientoVenta = await tx.tipoMovimiento.findFirst({
      where: { nombreTipo: 'Venta a Cliente' },
    });

    if (!tipoMovimientoVenta) {
      throw errorHelper.crearError('validacion', "Tipo de movimiento 'Venta a Cliente' no encontrado. Configure los datos iniciales.");
    }

    for (const item of nuevaVenta.detalleVentas) {
      await movimientosService.crearMovimiento(tx, {
        idVariante: item.idVariante,
        idTipoMovimiento: tipoMovimientoVenta.idTipoMovimiento,
        cantidad: -Number(item.cantidad),
        usuarioRegistro: usuario.idUsuario,
        motivo: `Venta ${nuevaVenta.numeroFactura}`,
        idVenta: nuevaVenta.idVenta,
      });
    }

    if (pagos.length > 0) {
      let saldoAnterior = totalFinal;
      for (const pago of pagos) {
        const monto = Number(pago.monto) || 0;
        const saldoNuevo = saldoAnterior - monto;
        await tx.pago.create({
          data: {
            idVenta: nuevaVenta.idVenta,
            idMetodoPago: Number(pago.idMetodoPago),
            monto,
            referencia: pago.referencia || null,
            saldoAnterior,
            saldoNuevo,
            tipoPago: 'inicial', // Primer pago de la venta
            usuarioRegistro: usuario.idUsuario,
          },
        });
        saldoAnterior = saldoNuevo;
      }
    }

    // ========================================================================
    // LÓGICA CORREGIDA: CRÉDITOS SOLO POR MÉTODO "CRÉDITO TIENDA"
    // ========================================================================
    // Identificar si hay pagos con método tipo "credito_tienda"
    // Solo esos pagos generan crédito real, el resto son pagos inmediatos
    
    let montoCreditoTienda = 0;

    if (pagos.length > 0) {
      // Buscar métodos de pago con tipo "credito_tienda" (id_tipo_metodo = 5)
      const metodosCreditoTienda = await tx.metodoPago.findMany({
        where: { 
          idTipoMetodo: 5, // Tipo "credito_tienda"
          activo: true 
        }
      });

      if (metodosCreditoTienda.length > 0) {
        const idsCreditoTienda = metodosCreditoTienda.map(m => m.idMetodoPago);
        
        // Sumar solo los pagos que usan métodos de tipo "credito_tienda"
        montoCreditoTienda = pagos
          .filter(p => idsCreditoTienda.includes(Number(p.idMetodoPago)))
          .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
      }
    }

    // Solo crear crédito si hay monto financiado con "Crédito Tienda"
    if (montoCreditoTienda > 0) {
      // Calcular monto inicial (suma de pagos NO crédito)
      const montoInicial = totalPagado - montoCreditoTienda;

      await tx.credito.create({
        data: {
          idVenta: nuevaVenta.idVenta,
          idUsuario: idUsuarioFinal,
          montoInicial: montoInicial, // Lo pagado al contado
          montoCredito: montoCreditoTienda, // Solo lo financiado
          montoTotal: montoCreditoTienda, // Total del crédito = solo lo financiado
          totalAbonado: 0, // Aún no ha abonado nada al crédito
          saldoPendiente: montoCreditoTienda, // Saldo = monto financiado
          usuarioRegistro: usuario.idUsuario,
          fechaInicio: new Date(),
          fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          estado: 'activo'
        },
      });

      // Actualizar o crear resumen de crédito del cliente
      await tx.clientesCreditoResumen.upsert({
        where: { idUsuario: idUsuarioFinal },
        update: {
          creditoTotal: { increment: montoCreditoTienda },
          saldoTotal: { increment: montoCreditoTienda },
          cantidadCreditosActivos: { increment: 1 },
          fechaUltimoCredito: new Date(),
          fechaActualizacion: new Date()
        },
        create: {
          idUsuario: idUsuarioFinal,
          creditoTotal: montoCreditoTienda,
          saldoTotal: montoCreditoTienda,
          cantidadCreditosActivos: 1,
          fechaUltimoCredito: new Date()
        }
      });
    }

    // ========================================================================
    // REGISTRO DE HISTORIAL DE DESCUENTO
    // ========================================================================
    if (codigoDescuentoUsado) {
      try {
        // El descuentoTotal enviado incluye descuentos por línea + el cupón global.
        // Restamos los descuentos por línea para obtener el valor neto del cupón.
        const totalDescLinea = detalleVentas.reduce((sum, item) => sum + (Number(item.descuentoLinea) || 0), 0);
        const valorNetoCupon = Math.max(0, Number(descuentoTotal) - totalDescLinea);

        await descuentosService._aplicarDescuentoEnTransaccion(
          tx, 
          codigoDescuentoUsado, 
          idUsuarioFinal, 
          nuevaVenta.idVenta, 
          Number(subtotalFinal),
          valorNetoCupon // Pasamos el valor ya calculado para mayor precisión
        );
      } catch (error) {
        console.error('Error al aplicar historial de descuento en transacción:', error);
        // Opcional: Si falla el historial, ¿deberíamos revertir todo?
        // Depende de si el historial es CRÍTICO.
        // Por ahora lanzamos el error para que revierta la transacción y asegure consistencia.
        throw error;
      }
    }

    return nuevaVenta;
  });
};

const actualizarEstado = async (id, idNuevoEstado) => {
  try {
    const ventaActualizada = await prisma.venta.update({
      where: { idVenta: parseInt(id, 10) },
      data: { idEstadoPedido: parseInt(idNuevoEstado, 10) },
    });
    return ventaActualizada;
  } catch (error) {
    if (error.code === 'P2025') {
      throw errorHelper.crearError(404, 'Venta no encontrada para actualizar.');
    }
    throw error;
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizarEstado,
};