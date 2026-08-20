module.exports = async function seedProveedores(prisma) {
  const proveedores = [
    {
      nombreProveedor: 'Textiles del Valle S.A.S',
      nitCC: '900123456-1',
      contacto: 'Carlos Pérez',
      correoElectronico: 'ventas@textilesvalle.com',
      telefono: '3001234567',
      direccion: 'Cali, Valle del Cauca',
      imagenProveedor: '/uploads/proveedores/textiles_valle.jpg'
    },
    {
      nombreProveedor: 'Calzado Nacional Ltda',
      nitCC: '800234567-2',
      contacto: 'María González',
      correoElectronico: 'info@calzadonacional.com',
      telefono: '3107654321',
      direccion: 'Bogotá D.C.',
      imagenProveedor: '/uploads/proveedores/calzado_nacional.jpg'
    },
    {
      nombreProveedor: 'Moda Antioqueña S.A.S',
      nitCC: '901345678-9',
      contacto: 'Juan Esteban Ríos',
      correoElectronico: 'contacto@modaantioquena.com',
      telefono: '3019988776',
      direccion: 'Medellín, Antioquia',
      imagenProveedor: '/uploads/proveedores/moda_antioquena.jpg'
    }
  ];

  for (const proveedor of proveedores) {
    await prisma.proveedor.upsert({
      where: { nitCC: proveedor.nitCC },
      update: {
        nombreProveedor: proveedor.nombreProveedor,
        contacto: proveedor.contacto,
        correoElectronico: proveedor.correoElectronico,
        telefono: proveedor.telefono,
        direccion: proveedor.direccion,
        imagenProveedor: proveedor.imagenProveedor,
        estado: 'activo'
      },
      create: {
        ...proveedor,
        estado: 'activo'
      }
    });
  }

  return proveedores.length;
};
