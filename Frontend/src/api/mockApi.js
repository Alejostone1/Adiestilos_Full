/**
 * @file mockApi.js
 * @brief Simulación de API basada en la estructura real de la base de datos.
 *
 * Este archivo emula un backend real para desarrollo frontend.
 * Cuando conectes a tu API real, reemplaza estas funciones por llamadas fetch().
 */

// ================== DATOS MOCK ==================

const categorias = [
  { id: 1, nombre: 'Camisetas' },
  { id: 2, nombre: 'Pantalones' },
  { id: 3, nombre: 'Zapatos' },
  { id: 4, nombre: 'Accesorios' },
];

const productos = [
  {
    id: 1,
    nombre: 'Camiseta Básica de Algodón',
    descripcion: 'Una camiseta suave y cómoda, perfecta para el día a día. Hecha con 100% algodón peruano.',
    precio_venta: 25.00,
    id_categoria: 1,
    tiene_colores: true,
    tiene_tallas: true,
    imagen_principal: '/images/productos/camiseta_blanca.jpg',
    categoria: { nombre: 'Camisetas' },
    imagenes: [
      { id: 1, url: '/images/productos/camiseta_blanca_1.jpg' },
      { id: 2, url: '/images/productos/camiseta_blanca_2.jpg' },
      { id: 3, url: '/images/productos/camiseta_blanca_3.jpg' },
    ],
    datos_tecnicos: {
      material: '100% Algodón Pima',
      cuidado: 'Lavar a máquina con agua fría. No usar lejía.',
      origen: 'Hecho en Perú',
    },
    destacado: true, // ✅ Para el carrusel de la home
  },
  {
    id: 2,
    nombre: 'Pantalón Jean Slim Fit',
    descripcion: 'Moderno y versátil, este jean se adapta a cualquier ocasión.',
    precio_venta: 75.50,
    id_categoria: 2,
    tiene_colores: false,
    tiene_tallas: true,
    imagen_principal: '/images/productos/pantalon_jean.jpg',
    categoria: { nombre: 'Pantalones' },
    imagenes: [
      { id: 4, url: '/images/productos/pantalon_jean_1.jpg' },
      { id: 5, url: '/images/productos/pantalon_jean_2.jpg' },
    ],
    datos_tecnicos: {
      material: '98% Algodón, 2% Elastano',
      cuidado: 'Lavar a máquina.',
      origen: 'Hecho en Colombia',
    },
    destacado: false,
  },
  {
    id: 3,
    nombre: 'Zapatillas Urbanas de Cuero',
    descripcion: 'Zapatillas de cuero genuino con un diseño minimalista y elegante.',
    precio_venta: 120.00,
    id_categoria: 3,
    tiene_colores: true,
    tiene_tallas: false,
    imagen_principal: '/images/productos/zapatillas_cuero.jpg',
    categoria: { nombre: 'Zapatos' },
    imagenes: [
      { id: 6, url: '/images/productos/zapatillas_cuero_1.jpg' },
      { id: 7, url: '/images/productos/zapatillas_cuero_2.jpg' },
    ],
    datos_tecnicos: {
      material: 'Exterior: 100% Cuero. Suela: Goma',
      cuidado: 'Limpiar con un paño húmedo.',
      origen: 'Hecho en Vietnam',
    },
    destacado: true, // ✅
  },
  {
    id: 4,
    nombre: 'Gorra de Béisbol',
    descripcion: 'Gorra clásica para protegerte del sol con estilo.',
    precio_venta: 15.00,
    id_categoria: 4,
    tiene_colores: true,
    tiene_tallas: false,
    imagen_principal: '/images/productos/gorra.jpg',
    categoria: { nombre: 'Accesorios' },
    imagenes: [
      { id: 8, url: '/images/productos/gorra_1.jpg' },
    ],
    datos_tecnicos: {
      material: '100% Algodón',
      cuidado: 'Lavar a mano.',
      origen: 'Hecho en China',
    },
    destacado: true, // ✅
  },
  {
    id: 5,
    nombre: 'Camiseta Estampada',
    descripcion: 'Camiseta con estampado gráfico, ideal para un look casual.',
    precio_venta: 30.00,
    id_categoria: 1,
    tiene_colores: false,
    tiene_tallas: true,
    imagen_principal: '/images/productos/camiseta_estampada.jpg',
    categoria: { nombre: 'Camisetas' },
    imagenes: [
      { id: 9, url: '/images/productos/camiseta_estampada_1.jpg' },
    ],
    datos_tecnicos: {
      material: '100% Algodón',
      cuidado: 'Lavar a máquina.',
      origen: 'Hecho en Perú',
    },
    destacado: true, // ✅
  },
  {
    id: 6,
    nombre: 'Bufanda de Lana Premium',
    descripcion: 'Suave bufanda de lana 100% natural, ideal para el invierno.',
    precio_venta: 35.00,
    id_categoria: 4,
    tiene_colores: true,
    tiene_tallas: false,
    imagen_principal: '/images/productos/bufanda.jpg',
    categoria: { nombre: 'Accesorios' },
    imagenes: [
      { id: 10, url: '/images/productos/bufanda_1.jpg' },
    ],
    datos_tecnicos: {
      material: '100% Lana Merina',
      cuidado: 'Lavar a mano con agua fría.',
      origen: 'Hecho en Argentina',
    },
    destacado: true, // ✅
  },
];

const variantes = [
  { id: 1, id_producto: 1, id_color: 1, id_talla: 1, stock: 10, imagen_url: '/images/variantes/camiseta_blanca_s.jpg' },
  { id: 2, id_producto: 1, id_color: 1, id_talla: 2, stock: 15, imagen_url: '/images/variantes/camiseta_blanca_m.jpg' },
  { id: 3, id_producto: 1, id_color: 2, id_talla: 2, stock: 5, imagen_url: '/images/variantes/camiseta_negra_m.jpg' },
  { id: 4, id_producto: 2, id_talla: 3, stock: 20 },
  { id: 5, id_producto: 3, id_color: 3, stock: 8, imagen_url: '/images/variantes/zapatillas_marron.jpg' },
  { id: 6, id_producto: 3, id_color: 1, stock: 12, imagen_url: '/images/variantes/zapatillas_blanco.jpg' },
  { id: 7, id_producto: 4, id_color: 2, stock: 25, imagen_url: '/images/variantes/gorra_negra.jpg' },
  { id: 8, id_producto: 5, id_talla: 2, stock: 18 },
  { id: 9, id_producto: 6, id_color: 1, stock: 14, imagen_url: '/images/variantes/bufanda_blanca.jpg' },
];

const colores = [
  { id: 1, nombre: 'Blanco', hex: '#FFFFFF' },
  { id: 2, nombre: 'Negro', hex: '#000000' },
  { id: 3, nombre: 'Marrón', hex: '#8B4513' },
  { id: 4, nombre: 'Azul Marino', hex: '#000080' },
];

const tallas = [
  { id: 1, nombre: 'S' },
  { id: 2, nombre: 'M' },
  { id: 3, nombre: 'L' },
  { id: 4, nombre: 'XL' },
  { id: 5, nombre: '32' },
  { id: 6, nombre: '34' },
  { id: 7, nombre: '36' },
];

// ================== UTILIDADES ==================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ================== FUNCIONES DE API ==================

export const fetchCategorias = async () => {

  await delay(500);
  return [...categorias];
};

export const fetchCategoriasDestacadas = async () => {

  await delay(400);
  // Retorna las primeras 3 categorías (puedes personalizar)
  return [...categorias].slice(0, 3);
};

export const fetchProductos = async (categoriaId = null) => {
  
  await delay(800);
  if (categoriaId) {
    return productos.filter(p => p.id_categoria === parseInt(categoriaId));
  }
  return [...productos];
};

export const fetchProductosDestacados = async () => {

  await delay(600);
  const destacados = productos.filter(p => p.destacado);
  // Si no hay destacados, toma los primeros 6
  return destacados.length > 0 ? [...destacados] : [...productos].slice(0, 6);
};

export const fetchProductoById = async (id) => {

  await delay(700);
  const producto = productos.find(p => p.id === parseInt(id));
  return producto ? { ...producto } : null;
};

export const fetchVariantesByProductoId = async (id) => {

  await delay(600);
  return variantes.filter(v => v.id_producto === parseInt(id)).map(v => ({ ...v }));
};

export const fetchColores = async () => {

  await delay(300);
  return [...colores];
};

export const fetchTallas = async () => {

  await delay(300);
  return [...tallas];
};