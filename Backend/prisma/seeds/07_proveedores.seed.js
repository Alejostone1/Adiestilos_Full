module.exports = async function seedProveedores(prisma) {
  const proveedores = [
    {
      nombreProveedor: 'Textiles del Valle S.A.S',
      nitCC: '900123456-1',
      contacto: 'Carlos Pérez',
      correoElectronico: 'ventas@textilesvalle.com',
      telefono: '3001234567',
      direccion: 'Cali, Valle del Cauca',
      notas: 'Proveedor principal de camisetas y blusas de algodón.',
      imagenProveedor: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
    },
    {
      nombreProveedor: 'Moda Antioqueña S.A.S',
      nitCC: '901345678-9',
      contacto: 'Juan Esteban Ríos',
      correoElectronico: 'contacto@modaantioquena.com',
      telefono: '3019988776',
      direccion: 'Medellín, Antioquia',
      notas: 'Proveedor de pantalones denim y vestidos de temporada.',
      imagenProveedor: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop'
    },
    {
      nombreProveedor: 'Confecciones del Atlántico S.A.S',
      nitCC: '800234567-2',
      contacto: 'María González',
      correoElectronico: 'info@confeccionesatlantico.com',
      telefono: '3107654321',
      direccion: 'Barranquilla, Atlántico',
      notas: 'Proveedor de blusas y prendas ligeras.',
      imagenProveedor: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop'
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
        notas: proveedor.notas,
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
