module.exports = async function seedTallas(prisma) {
  const tallas = [
    { nombreTalla: 'XS', tipoTalla: 'alfabetica' },
    { nombreTalla: 'S', tipoTalla: 'alfabetica' },
    { nombreTalla: 'M', tipoTalla: 'alfabetica' },
    { nombreTalla: 'L', tipoTalla: 'alfabetica' },
    { nombreTalla: 'XL', tipoTalla: 'alfabetica' },

    { nombreTalla: '36', tipoTalla: 'calzado' },
    { nombreTalla: '37', tipoTalla: 'calzado' },
    { nombreTalla: '38', tipoTalla: 'calzado' },
    { nombreTalla: '39', tipoTalla: 'calzado' },
    { nombreTalla: '40', tipoTalla: 'calzado' },

    { nombreTalla: 'Talla Única', tipoTalla: 'otra' }
  ];

  for (const talla of tallas) {
    await prisma.talla.upsert({
      where: { nombreTalla: talla.nombreTalla },
      update: {
        tipoTalla: talla.tipoTalla
      },
      create: talla
    });
  }

  return tallas.length;
};
