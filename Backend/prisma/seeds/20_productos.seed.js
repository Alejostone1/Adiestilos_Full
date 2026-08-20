/**
 * Seed - Productos Demo (3)
 * Crea 4 productos de tienda de ropa con sus variantes (color+talla), precios,
 * stock e imágenes. Reutiliza categorías, colores, tallas y proveedores existentes.
 *
 * Idempotente:
 *  - Producto  → upsert por `codigoReferencia` (único)
 *  - Variante  → upsert por `codigoSku` (único)
 *  - Imagen    → busca (idProducto|idVariante + rutaImagen) y actualiza o crea
 *
 * Solo se referencian archivos de imagen que EXISTEN físicamente en uploads/.
 */

const path = require('path');
const fs = require('fs');

function existeImagen(rutaPublica) {
  const relativa = rutaPublica.replace(/^\//, '');
  return fs.existsSync(path.resolve(process.cwd(), relativa));
}

function codigoColorCorto(nombreColor) {
  const limpieza = nombreColor.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return limpieza.length <= 3 ? limpieza : limpieza.slice(0, 3);
}

function generarSku(codigoReferencia, nombreColor, nombreTalla) {
  return `${codigoReferencia}-${codigoColorCorto(nombreColor)}-${nombreTalla}`;
}

async function upsertImagenProducto(prisma, idProducto, imagen) {
  const existente = await prisma.imagenProducto.findFirst({
    where: { idProducto, rutaImagen: imagen.ruta }
  });

  if (existente) {
    return prisma.imagenProducto.update({
      where: { idImagen: existente.idImagen },
      data: { descripcion: imagen.descripcion, orden: imagen.orden, esPrincipal: imagen.esPrincipal }
    });
  }

  return prisma.imagenProducto.create({
    data: {
      idProducto,
      rutaImagen: imagen.ruta,
      descripcion: imagen.descripcion,
      orden: imagen.orden,
      esPrincipal: imagen.esPrincipal
    }
  });
}

async function upsertImagenVariante(prisma, idVariante, ruta, descripcion, orden, esPrincipal) {
  const existente = await prisma.imagenVariante.findFirst({
    where: { idVariante, rutaImagen: ruta }
  });

  if (existente) {
    return prisma.imagenVariante.update({
      where: { idImagenVariante: existente.idImagenVariante },
      data: { descripcion, orden, esPrincipal }
    });
  }

  return prisma.imagenVariante.create({
    data: { idVariante, rutaImagen: ruta, descripcion, orden, esPrincipal }
  });
}

module.exports = async function seedProductos(prisma) {
  // 1. Catálogos base (reutilizar; nunca duplicar)
  const categorias = await prisma.categoria.findMany();
  const categoriaPorNombre = Object.fromEntries(categorias.map(c => [c.nombreCategoria, c.idCategoria]));

  const colores = await prisma.color.findMany();
  const colorPorNombre = Object.fromEntries(colores.map(c => [c.nombreColor, c.idColor]));

  const tallas = await prisma.talla.findMany();
  const tallaPorNombre = Object.fromEntries(tallas.map(t => [t.nombreTalla, t.idTalla]));

  const proveedores = await prisma.proveedor.findMany();
  const proveedorPorNombre = Object.fromEntries(proveedores.map(p => [p.nombreProveedor, p.idProveedor]));

  const imagenesVariantesDisponibles = [
    '/uploads/variantes/vari_1768153859230.jpeg',
    '/uploads/variantes/vari_1768158723518.png',
    '/uploads/variantes/vari_1768159539999.jpg',
    '/uploads/variantes/vari_1768666181343.png',
    '/uploads/variantes/vari_1768669749647.png',
    '/uploads/variantes/vari_1769372380128.png',
    '/uploads/variantes/vari_1769372438850.png',
    '/uploads/variantes/vari_1770900502519.png'
  ];

  // 2. Definición de productos demo
  const productos = [
    {
      codigoReferencia: 'CAM-001',
      nombreProducto: 'Camiseta Básica Algodón',
      descripcion: 'Camiseta de algodón premium, corte clásico y cuello redondo.',
      precioVentaSugerido: 25000,
      unidadMedida: 'unidad',
      tieneColores: true,
      tieneTallas: true,
      datosTecnicos: { material: 'Algodón 100%', cuidado: 'Lavar en frío' },
      nombreCategoria: 'Camisetas Hombre',
      nombreProveedor: 'Textiles del Valle S.A.S',
      colores: ['Negro', 'Blanco'],
      tallas: ['S', 'M', 'L', 'XL'],
      costo: 12000,
      venta: 25000,
      stock: 30,
      stockMinimo: 5,
      stockMaximo: 60,
      imagenes: [
        { ruta: '/uploads/productos/prod_1768665601149.jpg', descripcion: 'Camiseta básica algodón', esPrincipal: true }
      ]
    },
    {
      codigoReferencia: 'PAN-002',
      nombreProducto: 'Pantalón Jean Clásico',
      descripcion: 'Jeans de corte recto, tela denim resistente, 5 bolsillos.',
      precioVentaSugerido: 80000,
      unidadMedida: 'unidad',
      tieneColores: true,
      tieneTallas: true,
      datosTecnicos: { material: 'Denim 98% algodón, 2% elastano', cuidado: 'Lavar al revés' },
      nombreCategoria: 'Pantalones Hombre',
      nombreProveedor: 'Moda Antioqueña S.A.S',
      colores: ['Azul', 'Negro'],
      tallas: ['36', '38', '40'],
      costo: 45000,
      venta: 80000,
      stock: 20,
      stockMinimo: 3,
      stockMaximo: 40,
      imagenes: [
        { ruta: '/uploads/productos/prod_1769521467116.jpg', descripcion: 'Pantalón jean clásico', esPrincipal: true },
        { ruta: '/uploads/productos/prod_1769690818215.jpg', descripcion: 'Pantalón jean detalle', esPrincipal: false }
      ]
    },
    {
      codigoReferencia: 'VES-003',
      nombreProducto: 'Vestido Casual Verano',
      descripcion: 'Vestido ligero de corte A, perfecto para clima cálido.',
      precioVentaSugerido: 70000,
      unidadMedida: 'unidad',
      tieneColores: true,
      tieneTallas: true,
      datosTecnicos: { material: 'Viscosa modal', cuidado: 'No usar secadora' },
      nombreCategoria: 'Vestidos Mujer',
      nombreProveedor: 'Moda Antioqueña S.A.S',
      colores: ['Rosado', 'Blanco'],
      tallas: ['S', 'M', 'L'],
      costo: 38000,
      venta: 70000,
      stock: 15,
      stockMinimo: 3,
      stockMaximo: 30,
      imagenes: [
        { ruta: '/uploads/productos/prod_1768441369272.jpeg', descripcion: 'Vestido casual verano', esPrincipal: true },
        { ruta: '/uploads/productos/prod_1768176425890.jpeg', descripcion: 'Vestido detalle', esPrincipal: false }
      ]
    },
    {
      codigoReferencia: 'BLU-004',
      nombreProducto: 'Blusa Manga Corta',
      descripcion: 'Blusa femenina de manga corta con botones al frente.',
      precioVentaSugerido: 35000,
      unidadMedida: 'unidad',
      tieneColores: true,
      tieneTallas: true,
      datosTecnicos: { material: 'Poliéster 65%, Algodón 35%', cuidado: 'Planchar a baja temperatura' },
      nombreCategoria: 'Blusas Mujer',
      nombreProveedor: 'Textiles del Valle S.A.S',
      colores: ['Blanco', 'Rosado'],
      tallas: ['S', 'M', 'L'],
      costo: 18000,
      venta: 35000,
      stock: 25,
      stockMinimo: 5,
      stockMaximo: 50,
      imagenes: [
        { ruta: '/uploads/productos/prod_1768175413617.jpeg', descripcion: 'Blusa manga corta', esPrincipal: true }
      ]
    }
  ];

  // 3. Validar catálogo
  for (const p of productos) {
    if (!categoriaPorNombre[p.nombreCategoria]) {
      throw new Error(`Categoría '${p.nombreCategoria}' no encontrada. Ejecute 06_categorias.seed.js`);
    }
    if (!proveedorPorNombre[p.nombreProveedor]) {
      throw new Error(`Proveedor '${p.nombreProveedor}' no encontrado. Ejecute 07_proveedores.seed.js`);
    }
    if (!p.colores.every(c => colorPorNombre[c])) {
      throw new Error(`Un color de '${p.nombreProducto}' no existe. Ejecute 04_colores.seed.js`);
    }
    if (!p.tallas.every(t => tallaPorNombre[t])) {
      throw new Error(`Una talla de '${p.nombreProducto}' no existe. Ejecute 05_tallas.seed.js`);
    }
  }

  // 4. Crear/actualizar productos + variantes + imágenes
  let totalVariantes = 0;
  let totalImagenesProducto = 0;
  let totalImagenesVariante = 0;
  let indiceImagenVariante = 0;

  for (const p of productos) {
    const producto = await prisma.producto.upsert({
      where: { codigoReferencia: p.codigoReferencia },
      update: {
        nombreProducto: p.nombreProducto,
        descripcion: p.descripcion,
        precioVentaSugerido: p.precioVentaSugerido,
        unidadMedida: p.unidadMedida,
        tieneColores: p.tieneColores,
        tieneTallas: p.tieneTallas,
        datosTecnicos: p.datosTecnicos,
        idCategoria: categoriaPorNombre[p.nombreCategoria],
        idProveedor: proveedorPorNombre[p.nombreProveedor],
        estado: 'activo'
      },
      create: {
        codigoReferencia: p.codigoReferencia,
        nombreProducto: p.nombreProducto,
        descripcion: p.descripcion,
        precioVentaSugerido: p.precioVentaSugerido,
        unidadMedida: p.unidadMedida,
        tieneColores: p.tieneColores,
        tieneTallas: p.tieneTallas,
        datosTecnicos: p.datosTecnicos,
        idCategoria: categoriaPorNombre[p.nombreCategoria],
        idProveedor: proveedorPorNombre[p.nombreProveedor],
        estado: 'activo'
      }
    });

    // 4.1 Imágenes del producto
    for (const imagen of p.imagenes) {
      if (!existeImagen(imagen.ruta)) {
        console.warn(`[SEED] ⚠ Imagen de producto no encontrada, se omite: ${imagen.ruta}`);
        continue;
      }
      await upsertImagenProducto(prisma, producto.idProducto, { ...imagen, orden: 0 });
      totalImagenesProducto++;
    }

    // 4.2 Variantes (color × talla)
    for (const nombreColor of p.colores) {
      for (const nombreTalla of p.tallas) {
        const codigoSku = generarSku(p.codigoReferencia, nombreColor, nombreTalla);

        const variante = await prisma.varianteProducto.upsert({
          where: { codigoSku },
          update: {
            idProducto: producto.idProducto,
            idColor: colorPorNombre[nombreColor],
            idTalla: tallaPorNombre[nombreTalla],
            precioVenta: p.venta,
            precioCosto: p.costo,
            cantidadStock: p.stock,
            stockMinimo: p.stockMinimo,
            stockMaximo: p.stockMaximo,
            estado: 'activo'
          },
          create: {
            idProducto: producto.idProducto,
            idColor: colorPorNombre[nombreColor],
            idTalla: tallaPorNombre[nombreTalla],
            codigoSku,
            precioVenta: p.venta,
            precioCosto: p.costo,
            cantidadStock: p.stock,
            stockMinimo: p.stockMinimo,
            stockMaximo: p.stockMaximo,
            estado: 'activo'
          }
        });

        totalVariantes++;

        // 4.3 Imagen de variante (reutilizando archivos existentes en uploads/variantes)
        const rutaVariante = imagenesVariantesDisponibles[indiceImagenVariante % imagenesVariantesDisponibles.length];
        indiceImagenVariante++;

        if (existeImagen(rutaVariante)) {
          await upsertImagenVariante(
            prisma,
            variante.idVariante,
            rutaVariante,
            `Variante ${nombreColor} ${nombreTalla}`,
            0,
            true
          );
          totalImagenesVariante++;
        } else {
          console.warn(`[SEED] ⚠ Imagen de variante no encontrada, se omite: ${rutaVariante}`);
        }
      }
    }
  }

  return {
    productos: productos.length,
    variantes: totalVariantes,
    imagenesProducto: totalImagenesProducto,
    imagenesVariantes: totalImagenesVariante
  };
};