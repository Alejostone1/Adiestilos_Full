/**
 * @file rolesConstants.js
 * @brief Lista exhaustiva de permisos granulares del sistema.
 *
 * Define todos los módulos y acciones controladas. El frontend usa esta lista
 * para construir la matriz de permisos.
 */

const LISTA_PERMISOS = [
  // --- DASHBOARD ---
  {
    categoria: 'Dashboard',
    modulo: 'Panel Principal',
    clave: 'dashboard',
    descripcion: 'Acceso a los KPIs y métricas generales del sistema.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },

  // --- USUARIOS Y SEGURIDAD ---
  {
    categoria: 'Usuarios y Seguridad',
    modulo: 'Gestión de Usuarios',
    clave: 'usuarios',
    descripcion: 'Crear, editar y gestionar cuentas de usuario.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Usuarios y Seguridad',
    modulo: 'Roles y Permisos',
    clave: 'roles',
    descripcion: 'Configurar niveles de acceso y gobernanza del sistema.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },

  // --- CATÁLOGO DE PRODUCTOS ---
  {
    categoria: 'Catálogo de Productos',
    modulo: 'Productos y Variantes',
    clave: 'productos',
    descripcion: 'Gestionar productos base, tallas, colores y SKUs.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Catálogo de Productos',
    modulo: 'Categorías',
    clave: 'categorias',
    descripcion: 'Clasificar productos por familias o tipos.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Catálogo de Productos',
    modulo: 'Proveedores',
    clave: 'proveedores',
    descripcion: 'Directorio de empresas que suministran inventario.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Catálogo de Productos',
    modulo: 'Galería Media',
    clave: 'galeria',
    descripcion: 'Gestión centralizada de imágenes de productos.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },

  // --- VENTAS Y COBRANZAS ---
  {
    categoria: 'Ventas y Cobranzas',
    modulo: 'Gestión de Ventas',
    clave: 'ventas',
    descripcion: 'Registrar pedidos, facturas y realizar ventas.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Ventas y Cobranzas',
    modulo: 'Créditos y Cobros',
    clave: 'creditos',
    descripcion: 'Control de ventas a plazos, pagos y saldos de clientes.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Ventas y Cobranzas',
    modulo: 'Descuentos y Promociones',
    clave: 'descuentos',
    descripcion: 'Crear cupones y reglas de precios especiales.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Ventas y Cobranzas',
    modulo: 'Devoluciones',
    clave: 'devoluciones',
    descripcion: 'Gestionar notas crédito y retornos de productos.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },

  // --- COMPRAS E INVENTARIO ---
  {
    categoria: 'Compras e Inventario',
    modulo: 'Órdenes de Compra',
    clave: 'compras',
    descripcion: 'Abastecimiento de bodega y entrada de mercancía.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },
  {
    categoria: 'Compras e Inventario',
    modulo: 'Control de Inventario',
    clave: 'inventario',
    descripcion: 'Kardex, ajustes de stock y movimientos de bodega.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Solo Lectura', value: 'read' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },

  // --- REPORTES Y ANÁLISIS ---
  {
    categoria: 'Reportes y Análisis',
    modulo: 'Reportes de Negocio',
    clave: 'reportes',
    descripcion: 'Exportar informes de ventas, inventario y finanzas.',
    opciones: [
      { label: 'Acceso Total', value: 'full' },
      { label: 'Sin Acceso', value: 'none' }
    ]
  },

  // --- E-COMMERCE (PÚBLICO) ---
  {
    categoria: 'E-commerce (Cliente)',
    modulo: 'Catálogo Online',
    clave: 'ver_catalogo',
    tipo: 'boolean',
    label: 'Permitir ver el catálogo de la tienda'
  },
  {
    categoria: 'E-commerce (Cliente)',
    modulo: 'Carrito de Compras',
    clave: 'realizar_compras',
    tipo: 'boolean',
    label: 'Permitir realizar pedidos online'
  },
  {
    categoria: 'E-commerce (Cliente)',
    modulo: 'Historial Personal',
    clave: 'ver_historial',
    tipo: 'boolean',
    label: 'Permitir al usuario ver sus propios pedidos'
  }
];

module.exports = {
  LISTA_PERMISOS
};
