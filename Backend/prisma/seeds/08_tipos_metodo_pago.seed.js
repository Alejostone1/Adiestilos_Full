module.exports = async function seedTiposMetodoPago(prisma) {
  const tipos = [
    { codigo: 'efectivo', nombre: 'Efectivo', descripcion: 'Pago en efectivo' },

    { codigo: 'tarjeta_credito', nombre: 'Tarjeta Crédito', descripcion: 'Pago con tarjeta de crédito' },
    { codigo: 'tarjeta_debito', nombre: 'Tarjeta Débito', descripcion: 'Pago con tarjeta débito' },

    { codigo: 'transferencia', nombre: 'Transferencia', descripcion: 'Transferencia bancaria o digital' },

    { codigo: 'credito_tienda', nombre: 'Crédito Tienda', descripcion: 'Crédito otorgado por la tienda' },

    { codigo: 'mixto', nombre: 'Pago Mixto', descripcion: 'Combinación de dos o más métodos de pago' }
  ];

  for (const tipo of tipos) {
    await prisma.tipoMetodoPago.upsert({
      where: { codigo: tipo.codigo },
      update: {
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        activo: true
      },
      create: {
        ...tipo,
        activo: true
      }
    });
  }

  return tipos.length;
}
