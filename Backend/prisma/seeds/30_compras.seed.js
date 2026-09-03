/**
 * Seed - Compras a Proveedores (Inventario Inicial)
 *
 * GENERADOR DE STOCK REAL.
 * -------------------------------------------------------------------------
 * El inventario inicial de las variantes NO se inventa en el seed de productos.
 * Aquí se crean ORDENES DE COMPRA a los 3 proveedores reutilizando el mismo
 * servicio del backend (`comprasService.crear`), lo que garantiza:
 *
 *   1. Consistencia exacta con el flujo productivo (misma transacción).
 *   2. Creación de Compra + DetalleCompra por variante.
 *   3. Incremento real de `cantidadStock` en la variante.
 *   4. Registro de un MovimientoInventario de tipo ENTRADA con referencia a la
 *      compra (trazabilidad: variante -> stock -> movimiento -> compra -> proveedor).
 *
 * Cada variante se crea con stock 0 en 20_productos.seed.js; aquí adquiere su
 * stock a partir de la cantidad comprada. Como en este escenario inicial hay una
 * única compra por variante, el stock final es exactamente la cantidad recibida.
 *
 * Idempotente: si una compra con el mismo `numeroCompra` ya existe, se omite.
 * (Ejecutar `npm run db:seed` sobre una BD ya sembrada no duplica stock.)
 */

const comprasService = require('../../src/modules/compras/comprasService');

module.exports = async function seedCompras(prisma) {
  // 1. Usuario registrador (el administrador del sistema)
  const admin = await prisma.usuario.findFirst({
    where: { usuario: 'admin' }
  });
  if (!admin) {
    throw new Error('No se encontró el usuario "admin". Ejecute primero 10_usuarios.seed.js');
  }
  const idUsuarioRegistro = admin.idUsuario;

  // 2. Catálogos reutilizables
  const proveedores = await prisma.proveedor.findMany();
  const provPorNombre = Object.fromEntries(proveedores.map(p => [p.nombreProveedor, p.idProveedor]));

  const variantes = await prisma.varianteProducto.findMany({
    include: {
      producto: { select: { codigoReferencia: true, idProveedor: true } },
      color: { select: { nombreColor: true } },
      talla: { select: { nombreTalla: true } },
    }
  });
  const variantePorSku = Object.fromEntries(variantes.map(v => [v.codigoSku, v]));

  const sku = (codigoReferencia, color, talla) => {
    const lim = (s) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3);
    return `${codigoReferencia}-${lim(color)}-${talla}`;
  };

  // 3. Definición de compras (stock real de origen)
  //    Cada entrada: proveedor → líneas (var ref por color/talla + cantidad + precio)
  const compras = [
    {
      numeroCompra: 'OC-001',
      idProveedor: provPorNombre['Textiles del Valle S.A.S'],
      fechaCompra: new Date('2026-08-10'),
      fechaEntrega: new Date('2026-08-12'),
      notas: 'Compra inicial inventario camisetas básicas.',
      lineas: [
        { ref: 'CAM-001', color: 'Negro', talla: 'S', cantidad: 30, precio: 12000 },
        { ref: 'CAM-001', color: 'Negro', talla: 'M', cantidad: 25, precio: 12000 },
        { ref: 'CAM-001', color: 'Blanco', talla: 'S', cantidad: 20, precio: 12000 },
        { ref: 'CAM-001', color: 'Blanco', talla: 'M', cantidad: 15, precio: 12000 }
      ]
    },
    {
      numeroCompra: 'OC-002',
      idProveedor: provPorNombre['Confecciones del Atlántico S.A.S'],
      fechaCompra: new Date('2026-08-11'),
      fechaEntrega: new Date('2026-08-13'),
      notas: 'Compra inicial inventario blusas manga corta.',
      lineas: [
        { ref: 'BLU-004', color: 'Blanco', talla: 'S', cantidad: 28, precio: 18000 },
        { ref: 'BLU-004', color: 'Blanco', talla: 'M', cantidad: 22, precio: 18000 },
        { ref: 'BLU-004', color: 'Rosado', talla: 'S', cantidad: 26, precio: 18000 },
        { ref: 'BLU-004', color: 'Rosado', talla: 'M', cantidad: 24, precio: 18000 }
      ]
    },
    {
      numeroCompra: 'OC-003',
      idProveedor: provPorNombre['Moda Antioqueña S.A.S'],
      fechaCompra: new Date('2026-08-12'),
      fechaEntrega: new Date('2026-08-15'),
      notas: 'Compra inicial inventario pantalones y vestidos.',
      lineas: [
        { ref: 'PAN-002', color: 'Azul', talla: '36', cantidad: 12, precio: 45000 },
        { ref: 'PAN-002', color: 'Azul', talla: '38', cantidad: 10, precio: 45000 },
        { ref: 'PAN-002', color: 'Negro', talla: '36', cantidad: 14, precio: 45000 },
        { ref: 'PAN-002', color: 'Negro', talla: '38', cantidad: 11, precio: 45000 },
        { ref: 'VES-003', color: 'Rosado', talla: 'S', cantidad: 9, precio: 38000 },
        { ref: 'VES-003', color: 'Rosado', talla: 'M', cantidad: 8, precio: 38000 },
        { ref: 'VES-003', color: 'Blanco', talla: 'S', cantidad: 10, precio: 38000 },
        { ref: 'VES-003', color: 'Blanco', talla: 'M', cantidad: 7, precio: 38000 }
      ]
    }
  ];

  let totalCompras = 0;
  let totalLineas = 0;

  for (const compra of compras) {
    // Idempotencia: no recrear una compra ya existente
    const existente = await prisma.compra.findUnique({
      where: { numeroCompra: compra.numeroCompra }
    });
    if (existente) {
      console.log(`  ↪ Compra ${compra.numeroCompra} ya existe, se omite.`);
      continue;
    }

    // Construir detalleCompras a partir de las líneas (idVariante por SKU)
    const detalleCompras = compra.lineas.map((l) => {
      const codigoSku = sku(l.ref, l.color, l.talla);
      const variante = variantePorSku[codigoSku];
      if (!variante) {
        throw new Error(`Variante ${codigoSku} no encontrada. Ejecute primero 20_productos.seed.js`);
      }
      return {
        idVariante: variante.idVariante,
        cantidad: l.cantidad,
        precioUnitario: l.precio,
        descuentoLinea: 0
      };
    });

    await comprasService.crear({
      idProveedor: compra.idProveedor,
      idUsuarioRegistro,
      fechaCompra: compra.fechaCompra,
      fechaEntrega: compra.fechaEntrega,
      numeroCompra: compra.numeroCompra,
      impuestos: 0,
      notas: compra.notas,
      detalleCompras
    });

    totalCompras++;
    totalLineas += detalleCompras.length;
    console.log(`  ✔ Compra ${compra.numeroCompra} creada (${detalleCompras.length} líneas).`);
  }

  if (totalCompras === 0) {
    console.log('  ℹ No se crearon compras nuevas (ya existían).');
  }

  return { compras: totalCompras, lineas: totalLineas };
};
