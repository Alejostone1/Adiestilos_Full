module.exports = async function seedMetodosPago(prisma) {
  const tipos = await prisma.tipoMetodoPago.findMany();

  const tipo = Object.fromEntries(
    tipos.map(t => [t.codigo, t.idTipoMetodo])
  );

  const metodos = [
    // ===== EFECTIVO =====
    {
      nombreMetodo: 'Efectivo',
      descripcion: 'Pago total en efectivo',
      idTipoMetodo: tipo.efectivo,
      requiereReferencia: false
    },

    // ===== TARJETAS =====
    {
      nombreMetodo: 'Tarjeta Crédito',
      descripcion: 'Pago total con tarjeta de crédito',
      idTipoMetodo: tipo.tarjeta_credito,
      requiereReferencia: true
    },
    {
      nombreMetodo: 'Tarjeta Débito',
      descripcion: 'Pago total con tarjeta débito',
      idTipoMetodo: tipo.tarjeta_debito,
      requiereReferencia: true
    },

    // ===== TRANSFERENCIAS (COLOMBIA) =====
    {
      nombreMetodo: 'PSE',
      descripcion: 'Pago por PSE',
      idTipoMetodo: tipo.transferencia,
      requiereReferencia: true
    },
    {
      nombreMetodo: 'Nequi',
      descripcion: 'Pago con Nequi',
      idTipoMetodo: tipo.transferencia,
      requiereReferencia: true
    },
    {
      nombreMetodo: 'Daviplata',
      descripcion: 'Pago con Daviplata',
      idTipoMetodo: tipo.transferencia,
      requiereReferencia: true
    },

    // ===== CRÉDITO =====
    {
      nombreMetodo: 'Crédito Tienda',
      descripcion: 'Pago a crédito con la tienda',
      idTipoMetodo: tipo.credito_tienda,
      requiereReferencia: false
    },

    // ===== PAGOS MIXTOS (LO QUE PEDISTE) =====
    {
      nombreMetodo: 'Efectivo + Crédito',
      descripcion: 'Parte en efectivo y parte a crédito',
      idTipoMetodo: tipo.mixto,
      requiereReferencia: false
    },
    {
      nombreMetodo: 'Tarjeta Crédito + Crédito',
      descripcion: 'Parte tarjeta crédito y parte a crédito tienda',
      idTipoMetodo: tipo.mixto,
      requiereReferencia: true
    },
    {
      nombreMetodo: 'Tarjeta Débito + Crédito',
      descripcion: 'Parte tarjeta débito y parte a crédito tienda',
      idTipoMetodo: tipo.mixto,
      requiereReferencia: true
    },
    {
      nombreMetodo: 'Efectivo + Tarjeta',
      descripcion: 'Pago combinado efectivo y tarjeta',
      idTipoMetodo: tipo.mixto,
      requiereReferencia: true
    },
    {
      nombreMetodo: 'Transferencia + Crédito',
      descripcion: 'Pago transferencia y saldo a crédito',
      idTipoMetodo: tipo.mixto,
      requiereReferencia: true
    }
  ];

  for (const metodo of metodos) {
    await prisma.metodoPago.upsert({
      where: { nombreMetodo: metodo.nombreMetodo },
      update: {
        descripcion: metodo.descripcion,
        idTipoMetodo: metodo.idTipoMetodo,
        requiereReferencia: metodo.requiereReferencia,
        activo: true
      },
      create: {
        ...metodo,
        activo: true
      }
    });
  }

  return metodos.length;
}
