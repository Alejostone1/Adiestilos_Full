module.exports = async function seedEstadosPedido(prisma) {
  const estados = [
    { nombreEstado: 'Pendiente', descripcion: 'Pedido registrado, pendiente de procesamiento', color: '#FFA500', orden: 1, activo: true },
    { nombreEstado: 'Confirmado', descripcion: 'Pedido confirmado, listo para preparar', color: '#2196F3', orden: 2, activo: true },
    { nombreEstado: 'En Preparación', descripcion: 'Pedido en proceso de preparación', color: '#9C27B0', orden: 3, activo: true },
    { nombreEstado: 'Listo para Entrega', descripcion: 'Pedido preparado, listo para despacho', color: '#00BCD4', orden: 4, activo: true },
    { nombreEstado: 'En Tránsito', descripcion: 'Pedido en camino al cliente', color: '#FF9800', orden: 5, activo: true },
    { nombreEstado: 'Entregado', descripcion: 'Pedido entregado al cliente', color: '#4CAF50', orden: 6, activo: true },
    { nombreEstado: 'Cancelado', descripcion: 'Pedido cancelado', color: '#F44336', orden: 7, activo: true },

    { nombreEstado: 'Recibido', descripcion: 'Compra recibida en bodega', color: '#8BC34A', orden: 8, activo: true },
    { nombreEstado: 'Pendiente de Pago', descripcion: 'Compra pendiente de pago al proveedor', color: '#FF6F00', orden: 9, activo: true },
    { nombreEstado: 'Parcialmente Recibido', descripcion: 'Compra recibida de forma parcial', color: '#FFB300', orden: 10, activo: true },
    { nombreEstado: 'Completado', descripcion: 'Compra completada y pagada', color: '#2E7D32', orden: 11, activo: true },

    { nombreEstado: 'Devolución Solicitada', descripcion: 'Cliente solicitó devolución', color: '#E65100', orden: 12, activo: true },
    { nombreEstado: 'Devolución en Revisión', descripcion: 'Devolución siendo evaluada', color: '#5E35B1', orden: 13, activo: true },
    { nombreEstado: 'Devolución Aprobada', descripcion: 'Devolución aprobada', color: '#1976D2', orden: 14, activo: true },
    { nombreEstado: 'Devolución Rechazada', descripcion: 'Devolución rechazada', color: '#C62828', orden: 15, activo: true },
    { nombreEstado: 'Reembolsado', descripcion: 'Devolución completada', color: '#00897B', orden: 16, activo: true },

    { nombreEstado: 'Crédito Activo', descripcion: 'Crédito activo', color: '#FBC02D', orden: 17, activo: true },
    { nombreEstado: 'Crédito Vencido', descripcion: 'Crédito vencido', color: '#D84315', orden: 18, activo: true },
    { nombreEstado: 'Crédito Pagado', descripcion: 'Crédito liquidado', color: '#388E3C', orden: 19, activo: true },
    { nombreEstado: 'En Cobranza', descripcion: 'Crédito en cobranza', color: '#E64A19', orden: 20, activo: true }
  ];

  for (const estado of estados) {
    await prisma.estadoPedido.upsert({
      where: { nombreEstado: estado.nombreEstado },
      update: estado,
      create: estado
    });
  }

  return estados.length;
};
