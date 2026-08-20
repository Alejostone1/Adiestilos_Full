# Guía Rápida de Validaciones - Precios en Variantes

## Validaciones Implementadas en el Backend ✅

### En `variantesController.js` (Controlador)

```javascript
/**
 * Validaciones al crear variante
 */
const crearVariante = async (req, res) => {
  const { idProducto, codigoSku, precioVenta, precioCosto } = req.body;

  // 1️⃣ Campos obligatorios
  if (!idProducto || !codigoSku || precioVenta === undefined || precioCosto === undefined) {
    return handleHttpError(res, 
      'Los campos "idProducto", "codigoSku", "precioVenta" y "precioCosto" son obligatorios.', 
      400);
  }

  // 2️⃣ Validar que sean números válidos
  const precioVentaNum = Number(precioVenta);
  const precioCostoNum = Number(precioCosto);

  if (isNaN(precioVentaNum) || precioVentaNum <= 0) {
    return handleHttpError(res, 
      'precioVenta debe ser un número mayor a 0.', 
      400);
  }

  if (isNaN(precioCostoNum) || precioCostoNum < 0) {
    return handleHttpError(res, 
      'precioCosto debe ser un número mayor o igual a 0.', 
      400);
  }

  // 3️⃣ Validar margen positivo
  if (precioVentaNum <= precioCostoNum) {
    return handleHttpError(res, 
      'precioVenta debe ser mayor que precioCosto. El margen debe ser positivo.', 
      400);
  }

  // 4️⃣ Proceder con creación
  const idUsuario = req.usuario.idUsuario;
  const nuevaVariante = await variantesService.crearVariante(datosVariante, idUsuario);
  sendSuccess(res, nuevaVariante, 'Variante creada exitosamente.', 201);
};
```

### En `variantesService.js` (Servicio)

```javascript
/**
 * Validaciones al crear variante
 */
const crearVariante = async (datosVariante, idUsuario) => {
  const { idProducto, idColor, idTalla, ...restoDatos } = datosVariante;

  // 1️⃣ Validar no existe combinación producto-color-talla duplicada
  const varianteExistente = await prisma.varianteProducto.findFirst({
    where: {
      idProducto: idProducto,
      idColor: idColor,
      idTalla: idTalla,
    },
  });

  if (varianteExistente) {
    const error = new Error(
      'Ya existe una variante con la misma combinación de producto, color y talla.'
    );
    error.statusCode = 409; // Conflict
    throw error;
  }

  // 2️⃣ Crear con transacción (garantiza consistencia)
  return prisma.$transaction(async (tx) => {
    // Crear variante
    const nuevaVariante = await tx.varianteProducto.create({
      data: {
        ...restoDatos,
        idProducto,
        idColor,
        idTalla,
        cantidadStock: 0,
      },
      include: { color: true, talla: true }
    });

    // Registrar movimiento inicial si hay stock
    if (cantidadStock > 0) {
      // ... registrar movimiento
    }

    return nuevaVariante;
  });
};
```

---

## Validaciones en el Formulario del Frontend (Recomendadas) 📋

```javascript
/**
 * Validación de precio de compra (precioCosto)
 */
const validarPrecioCosto = (valor) => {
  // ❌ Vacío
  if (!valor && valor !== 0) {
    return 'El precio de compra es obligatorio';
  }

  // ❌ No es número
  const numValue = Number(valor);
  if (isNaN(numValue)) {
    return 'Debe ser un número válido';
  }

  // ❌ Negativo
  if (numValue < 0) {
    return 'No puede ser negativo';
  }

  // ✅ OK
  return null;
};

/**
 * Validación de precio de venta (precioVenta)
 */
const validarPrecioVenta = (valor) => {
  // ❌ Vacío
  if (!valor && valor !== 0) {
    return 'El precio de venta es obligatorio';
  }

  // ❌ No es número
  const numValue = Number(valor);
  if (isNaN(numValue)) {
    return 'Debe ser un número válido';
  }

  // ❌ No positivo
  if (numValue <= 0) {
    return 'Debe ser mayor a 0';
  }

  // ✅ OK
  return null;
};

/**
 * Validación de margen (Comparativa entre ambos precios)
 */
const validarMargen = (precioVenta, precioCosto) => {
  const pv = Number(precioVenta);
  const pc = Number(precioCosto);

  // ❌ Margen negativo o cero
  if (pv <= pc) {
    return `El precio de venta debe ser mayor que el costo. Margen actual: $${pv - pc}`;
  }

  // ⚠️ Margen muy bajo (opcional, advertencia)
  const margen = pv - pc;
  const margenPorcentaje = (margen / pv) * 100;
  
  if (margenPorcentaje < 10) {
    console.warn(`⚠️ Margen bajo: ${margenPorcentaje.toFixed(2)}%`);
  }

  // ✅ OK
  return null;
};
```

---

## Estados de Validación en UI (Recomendado) 🎨

```javascript
/**
 * Estados del campo de precio de compra
 */
const estadoPrecioCosto = {
  // 🔴 Error
  error: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
    icon: '⚠️',
    mensaje: 'Precio de compra inválido'
  },
  
  // 🟡 Advertencia
  warning: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
    icon: '⚡',
    mensaje: 'Margen bajo'
  },
  
  // 🟢 OK
  success: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
    icon: '✅',
    mensaje: 'Correcto'
  },
  
  // ⚪ Neutral
  neutral: {
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    icon: '',
    mensaje: ''
  }
};
```

---

## Ejemplos de Validación (Casos de Uso) 📚

### ✅ VÁLIDO
```javascript
{
  precioCosto: 5000,
  precioVenta: 15000,
  margen: 10000,
  margenPorcentaje: 66.67
}
// ✅ Todo OK
```

### ❌ INVÁLIDO: Margen negativo
```javascript
{
  precioCosto: 15000,
  precioVenta: 5000
}
// ❌ Error: "precioVenta debe ser mayor que precioCosto"
```

### ❌ INVÁLIDO: Margen cero
```javascript
{
  precioCosto: 10000,
  precioVenta: 10000
}
// ❌ Error: "El margen debe ser positivo"
```

### ❌ INVÁLIDO: precioCosto negativo
```javascript
{
  precioCosto: -5000,
  precioVenta: 15000
}
// ❌ Error: "precioCosto debe ser un número mayor o igual a 0"
```

### ❌ INVÁLIDO: precioVenta = 0
```javascript
{
  precioCosto: 5000,
  precioVenta: 0
}
// ❌ Error: "precioVenta debe ser un número mayor a 0"
```

### ⚠️ VÁLIDO pero CON ADVERTENCIA: Margen muy bajo
```javascript
{
  precioCosto: 9500,
  precioVenta: 10000,
  margen: 500,
  margenPorcentaje: 5    // < 10% = Advertencia
}
// ⚠️ OK pero mostrar advertencia
```

---

## Tabla de Validaciones

| Campo | Tipo | Rango | Obligatorio | Validación Adicional |
|-------|------|-------|-------------|---------------------|
| `precioCosto` | Decimal | >= 0 | ✅ SÍ | Debe ser <= precioVenta |
| `precioVenta` | Decimal | > 0 | ✅ SÍ | Debe ser > precioCosto |
| `margen` | Decimal | > 0 | Calculado | Automático |
| `margenPorcentaje` | Decimal | > 0% | Calculado | Automático |

---

## Flujo de Validación Recomendado (Frontend)

```
Usuario ingresa precioCosto
   ↓
[Validación en tiempo real]
   ├─ ¿Es número? ❌ → Mostrar error
   ├─ ¿Es >= 0? ❌ → Mostrar error
   └─ ✅ → Permitir continuar
   ↓
Usuario ingresa precioVenta
   ↓
[Validación en tiempo real]
   ├─ ¿Es número? ❌ → Mostrar error
   ├─ ¿Es > 0? ❌ → Mostrar error
   └─ ✅ → Permitir continuar
   ↓
[Validación de margen]
   ├─ ¿precioVenta > precioCosto? ❌ → Mostrar error, deshabilitar envío
   ├─ ¿margenPorcentaje >= 10%? ⚠️ → Mostrar advertencia
   └─ ✅ → Habilitar botón enviar
   ↓
Usuario hace clic en "Crear Variante"
   ↓
[Validación en Backend] (nuevamente por seguridad)
   ↓
Crear variante ✅
```

---

## Errores HTTP Esperados

| Código | Situación | Mensaje |
|--------|-----------|---------|
| 201 | ✅ Créación exitosa | `"Variante creada exitosamente"` |
| 400 | ❌ Validación fallida | `"Los campos obligatorios..."` |
| 400 | ❌ Precio inválido | `"precioVenta debe ser un número..."` |
| 400 | ❌ Margen negativo | `"precioVenta debe ser mayor que precioCosto..."` |
| 409 | ❌ Variante duplicada | `"Ya existe una variante con..."` |
| 404 | ❌ Producto no existe | `"Producto no encontrado"` |
| 500 | ❌ Error del servidor | `"Error al crear la variante"` |

---

## Checklist Final ✅

**Backend (YA IMPLEMENTADO):**
- ✅ Controlador valida campos obligatorios
- ✅ Controlador valida tipos de datos
- ✅ Controlador valida margen positivo
- ✅ Servicio valida duplicados
- ✅ Formatter calcula margen automáticamente
- ✅ API retorna margen en respuesta

**Frontend (PENDIENTE - RECOMENDADO):**
- ⏳ Validar precioCosto en tiempo real
- ⏳ Validar precioVenta en tiempo real
- ⏳ Mostrar cálculo de margen en tiempo real
- ⏳ Deshabilitar botón si hay error
- ⏳ Mostrar advertencia si margen < 10%
- ⏳ Enviar ambos precios al crear variante

---

## Referencias

- 📄 Arquitectura Precios: `Backend/ARQUITECTURA_PRECIOS.md`
- 📝 Cambios Realizados: `Backend/CAMBIOS_ARQUITECTURA_PRECIOS.md`
- 📚 Schema: `Backend/prisma/schema.prisma`
- 🔧 Controlador: `Backend/src/modules/variantes/variantesController.js`
- 🔧 Servicio: `Backend/src/modules/variantes/variantesService.js`
- 🔧 Formatter: `Backend/src/modules/variantes/variantesFormatter.js`
