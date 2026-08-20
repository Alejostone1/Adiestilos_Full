# Arquitectura de Precios - Sistema ADI Estilos

## Resumen Ejecutivo

Los precios en ADI Estilos están distribuidos en **DOS niveles**:

| Nivel | Campo | Propósito | Ubicación |
|-------|-------|-----------|-----------|
| **Producto** | `precioVentaSugerido` | Referencia informativa | `productos` |
| **Variante** | `precioCosto` | Costo de compra (REAL) | `variantes_producto` |
| **Variante** | `precioVenta` | Precio de venta (REAL) | `variantes_producto` |

---

## ¿Por qué está distribuido así?

### 1️⃣ Flexibilidad de Precios

Cada variante puede tener **diferentes precios**:

```
Producto: "Camisa"
├── Variante 1: Rojo - M
│   ├── precioCosto: $5.000 (costo de compra)
│   ├── precioVenta: $15.000 (precio de venta)
│   └── Margen: $10.000
│
├── Variante 2: Azul - M
│   ├── precioCosto: $4.500 (más barato de otro proveedor)
│   ├── precioVenta: $14.000
│   └── Margen: $9.500
│
└── Variante 3: Rojo - L
    ├── precioCosto: $6.000 (usa más tela)
    ├── precioVenta: $16.000
    └── Margen: $10.000
```

### 2️⃣ Precisión en Inventario

- Cada variante es única (SKU)
- Cada una controla su propio stock
- Cada una tiene su propio costo/margen
- Facilita reportes de rentabilidad por variante

### 3️⃣ Integridad Contable

- Los costos reales vienen de **compras a proveedores**
- Se actualizan en `precioCosto` al recibir compras
- Permite cálculo exacto de margen por variante
- Auditoría completa en `movimientos_inventario`

---

## Flujos de Datos

### 📥 Entrada: Crear Variante

```javascript
// Request del Frontend:
POST /api/variantes
{
  idProducto: 1,
  codigoSku: "CAM-ROJO-M",
  idColor: 5,        // Rojo
  idTalla: 2,        // M
  precioCosto: 5000,  // ← PRECIO DE COMPRA (obligatorio)
  precioVenta: 15000  // ← PRECIO DE VENTA (obligatorio)
}

// Response:
{
  idVariante: 42,
  codigoSku: "CAM-ROJO-M",
  precioCosto: 5000,
  precioVenta: 15000,
  margen: 10000,              // Calculado: precioVenta - precioCosto
  margenPorcentaje: 66.67,    // Calculado: (margen / precioVenta) * 100
  cantidadStock: 0,
  estado: "activo"
}
```

### 🛒 Consulta: Obtener Producto con Variantes

```javascript
// GET /api/productos/1
{
  idProducto: 1,
  nombreProducto: "Camisa",
  precioVentaSugerido: 15000,    // Solo referencia
  variantes: [
    {
      idVariante: 42,
      codigoSku: "CAM-ROJO-M",
      color: { idColor: 5, nombreColor: "Rojo" },
      talla: { idTalla: 2, nombreTalla: "M" },
      precioCosto: 5000,      // ← PRECIO DE COMPRA
      precioVenta: 15000,     // ← PRECIO DE VENTA
      margen: 10000,          // ← Calculado en backend
      margenPorcentaje: 66.67,
      cantidadStock: 50,
      estado: "activo"
    },
    ...
  ]
}
```

### 🏪 Compra a Proveedor

```javascript
// La compra actualiza precioCosto en variantes
POST /api/compras
{
  idProveedor: 3,
  detalleCompras: [
    {
      idVariante: 42,
      cantidad: 100,
      precioUnitario: 5000,  // ← Se guarda aquí
      subtotal: 500000
    }
  ]
}

// Resultado: La variante #42 actualiza su precioCosto a 5000
```

### 💰 Venta a Cliente

```javascript
// La venta usa precioVenta y registra movimiento
POST /api/ventas
{
  detalleVentas: [
    {
      idVariante: 42,
      cantidad: 5,
      precioUnitario: 15000,  // ← De variante.precioVenta
      subtotal: 75000
    }
  ]
}

// Resultado:
// 1. Disminuye cantidadStock en 5
// 2. Registra movimiento en movimientos_inventario
// 3. Usa precioVenta para cálculo de factura
```

---

## Campos de Respuesta API

### Para Producto con Variantes

El servicio debe retornar **SIEMPRE**:

```javascript
{
  // Datos del Producto
  idProducto: Number,
  nombreProducto: String,
  codigoReferencia: String,
  precioVentaSugerido: Number,
  descripcion: String,
  tieneColores: Boolean,
  tieneTallas: Boolean,

  // Datos de Variantes (CRÍTICO para Frontend)
  variantes: [
    {
      idVariante: Number,
      codigoSku: String,
      
      // ⭐ PRECIOS (OBLIGATORIO)
      precioCosto: Number,      // Precio de compra
      precioVenta: Number,      // Precio de venta
      margen: Number,           // Calculado: precioVenta - precioCosto
      margenPorcentaje: Number, // Calculado: (margen / precioVenta) * 100
      
      // Stock
      cantidadStock: Number,
      stockMinimo: Number,
      stockMaximo: Number,
      
      // Variantes
      color: { idColor, nombreColor, codigoHex },
      talla: { idTalla, nombreTalla },
      
      estado: String
    }
  ]
}
```

---

## Checklist de Implementación

### ✅ Backend

- [x] Modelo Producto con `precioVentaSugerido` (referencia)
- [x] Modelo VarianteProducto con `precioCosto` y `precioVenta`
- [x] Servicio de variantes retorna ambos campos
- [x] Cálculo de margen en respuestas
- [x] Actualización de `precioCosto` al recibir compras
- [x] Auditoría en movimientos_inventario

### 📋 Frontend - Campos Requeridos

Para crear/editar variante, el frontend DEBE solicitar:

```javascript
{
  idProducto: Number,      // Obligatorio
  codigoSku: String,       // Obligatorio, único
  idColor: Number,         // Si el producto tieneColores
  idTalla: Number,         // Si el producto tieneTallas
  precioCosto: Number,     // ⭐ Obligatorio (Precio de Compra)
  precioVenta: Number,     // ⭐ Obligatorio (Precio de Venta)
  cantidadStock: Number,   // Opcional (default: 0)
  stockMinimo: Number,     // Opcional
  stockMaximo: Number      // Opcional
}
```

### 🔍 Validaciones Recomendadas

```javascript
// En Controlador de Variantes:
if (!precioCosto || precioCosto <= 0) {
  throw new Error('precioCosto es obligatorio y debe ser > 0');
}

if (!precioVenta || precioVenta <= 0) {
  throw new Error('precioVenta es obligatorio y debe ser > 0');
}

if (precioVenta <= precioCosto) {
  throw new Error('precioVenta debe ser mayor que precioCosto');
}

// Validar SKU único
if (await varianteExists(codigoSku)) {
  throw new Error('Ya existe una variante con este SKU');
}
```

---

## Ejemplos de Consultas SQL

### Ver Variantes con Margen Calculado

```sql
SELECT 
  vp.id_variante,
  vp.codigo_sku,
  vp.precio_costo,
  vp.precio_venta,
  (vp.precio_venta - vp.precio_costo) as margen,
  ROUND(((vp.precio_venta - vp.precio_costo) / vp.precio_venta * 100), 2) as margen_porcentaje,
  vp.cantidad_stock,
  p.nombre_producto,
  c.nombre_color,
  t.nombre_talla
FROM variantes_producto vp
JOIN productos p ON vp.id_producto = p.id_producto
LEFT JOIN colores c ON vp.id_color = c.id_color
LEFT JOIN tallas t ON vp.id_talla = t.id_talla
WHERE vp.estado = 'activo'
ORDER BY p.nombre_producto;
```

### Variantes con Stock Bajo

```sql
SELECT * FROM variantes_producto
WHERE cantidad_stock <= stock_minimo
AND estado = 'activo'
ORDER BY cantidad_stock ASC;
```

---

## Preguntas Frecuentes

### ❓ ¿Por qué no incluir precioCosto en el Producto?

**Respuesta:** Porque productos pueden tener múltiples variantes con costos diferentes:
- Diferentes proveedores
- Diferentes materiales
- Diferentes tamaños/colores
- Cambios de precio en el tiempo

### ❓ ¿Qué es precioVentaSugerido?

**Respuesta:** Es un precio referencia a nivel de producto. Los precios REALES que se usan en:
- Facturas
- Reportes
- Cálculos de margen

...están en `variantes.precioVenta`

### ❓ ¿El frontend envía precioCosto?

**Respuesta:** **SÍ**, es OBLIGATORIO. Se puede:
1. Ingresar manualmente al crear variante
2. Importar desde compras (si ya existe precio de compra)
3. Actualizar desde recepción de compra

### ❓ ¿Cómo se actualiza precioCosto?

**Respuesta:** En 2 formas:
1. **Manual**: Editar variante (poca recomendable, pierde historial)
2. **Por Compra**: Al recibir productos, se actualiza automáticamente

```javascript
// En recepción de compra:
UPDATE variantes_producto 
SET precio_costo = ? 
WHERE id_variante = ?;

// Se registra en:
INSERT INTO movimientos_inventario (...)
```

---

## Resumen para Developers

| Aspecto | Detalle |
|--------|---------|
| **Precio Referencia** | `Producto.precioVentaSugerido` |
| **Precio Real de Compra** | `VarianteProducto.precioCosto` |
| **Precio Real de Venta** | `VarianteProducto.precioVenta` |
| **Margen** | `precioVenta - precioCosto` |
| **Ubicación Stock** | `VarianteProducto.cantidadStock` |
| **Quién Usa Ambos Precios** | Frontend (UI de crear/editar variante) |
| **Dónde Validar** | Controlador de variantes |
| **Dónde Calcular Margen** | Backend (servicio) |
