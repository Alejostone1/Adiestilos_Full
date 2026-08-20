module.exports = async function seedColores(prisma) {
  const colores = [
    { nombreColor: 'Negro', codigoHex: '#000000' },
    { nombreColor: 'Blanco', codigoHex: '#FFFFFF' },
    { nombreColor: 'Gris', codigoHex: '#808080' },
    { nombreColor: 'Azul', codigoHex: '#0000FF' },
    { nombreColor: 'Rojo', codigoHex: '#FF0000' },
    { nombreColor: 'Verde', codigoHex: '#008000' },
    { nombreColor: 'Amarillo', codigoHex: '#FFFF00' },
    { nombreColor: 'Morado', codigoHex: '#800080' },
    { nombreColor: 'Rosado', codigoHex: '#FFC0CB' }
  ];

  for (const color of colores) {
    await prisma.color.upsert({
      where: { nombreColor: color.nombreColor },
      update: {
        codigoHex: color.codigoHex,
        estado: 'activo'
      },
      create: {
        nombreColor: color.nombreColor,
        codigoHex: color.codigoHex,
        estado: 'activo'
      }
    });
  }

  return colores.length;
};
