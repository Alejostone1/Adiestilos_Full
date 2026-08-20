# Guía Visual del Wizard de Productos

## Pantalla 1: Información Básica 📦

```
┌─────────────────────────────────────────────────┐
│  ✨ Crear Nuevo Producto                    [X] │
│  Paso 1 de 5                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ℹ️  Ingresa los datos básicos...             │
│                                                 │
│  📦 Información Básica > Detalles > Precios >  │
│     Imágenes > Resumen                         │
│                                                 │
│  Nombre del Producto *                          │
│  ┌────────────────────────────────────────────┐│
│  │ Ej: Camiseta Estampada Blanca              ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  Código de Referencia *                         │
│  ┌────────────────────────────────────────────┐│
│  │ Ej: CAMISETA-BL-001                        ││
│  └────────────────────────────────────────────┘│
│                                                 │
│  Categoría *                                    │
│  ┌─────────────────────────────────────────┐  │
│  │ 🔍 Buscar categoría...                  │  │
│  │ ✓ Ropa                                  │  │
│  │   Accesorios                            │  │
│  │   Calzado                               │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Anterior] (1/5) [Siguiente →]                 │
└─────────────────────────────────────────────────┘
```

## Pantalla 3: Precios 💰

```
┌─────────────────────────────────────────────────┐
│  ✨ Crear Nuevo Producto                    [X] │
│  Paso 3 de 5                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Básica   Detalles   💰 Precios   Imágenes    │
│                                                 │
│  ℹ️  Ingresa los precios...                   │
│                                                 │
│  Precio de Compra *        Precio de Venta *  │
│  ┌─────────────────┐     ┌─────────────────┐  │
│  │ $ 50.00         │     │ $ 75.00         │  │
│  └─────────────────┘     └─────────────────┘  │
│                                                 │
│  ┌──────────┬──────────┬──────────┐           │
│  │   $50    │ Margen   │ $75      │           │
│  │ Costo    │ $25 (50%)│ Venta    │           │
│  └──────────┴──────────┴──────────┘           │
│                                                 │
│  Porcentaje de Ganancia                        │
│  ██████████████████ 50% ✓ Ganancia Excelente  │
│                                                 │
│  Calculadora Rápida                            │
│  [+15%] [+25%] [+30%]                         │
│                                                 │
├─────────────────────────────────────────────────┤
│ [← Anterior] (3/5) [Siguiente →]               │
└─────────────────────────────────────────────────┘
```

## Pantalla 5: Resumen Final ✅

```
┌─────────────────────────────────────────────────┐
│  ✨ Crear Nuevo Producto                    [X] │
│  Paso 5 de 5                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✓ Revisa los datos antes de guardar          │
│                                                 │
│  📸 Imagen Principal                           │
│  ┌─────────────────────────┐                   │
│  │                         │  Camiseta        │
│  │    [Imagen]             │  2 imágenes     │
│  │                         │  adicionales    │
│  └─────────────────────────┘  [T][T][T][T]    │
│                                                 │
│  📦 Información Básica                         │
│  ┌─────────────────────────────────────────┐  │
│  │ Nombre    │ Camiseta Estampada Blanca  │  │
│  │ Código    │ CAMISETA-BL-001            │  │
│  │ Descripción                             │  │
│  │ Una camiseta de alta calidad...         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  💰 Precios y Márgenes                         │
│  ┌──────────┬──────────┬──────────┐           │
│  │ Costo    │ Margen   │ Venta    │           │
│  │ $50.00   │ $25 50%  │ $75.00   │           │
│  └──────────┴──────────┴──────────┘           │
│                                                 │
│  ✓ El producto será creado...                 │
│                                                 │
├─────────────────────────────────────────────────┤
│ [← Anterior] (5/5) [✓ Guardar Producto]       │
└─────────────────────────────────────────────────┘
```

## Indicadores de Progreso

```
PASO 1          PASO 2          PASO 3
┌─────┐       ┌─────┐       ┌─────┐
│  📦 │─────→ │  🏷 │─────→ │  💰 │─────→
└─────┘       └─────┘       └─────┘
             (Completado)   (Actual)

PASO 4          PASO 5
┌─────┐       ┌─────┐
→ │  🖼 │─────→ │  ✓ │
└─────┘       └─────┘
```

## Estados de Validación

### ✅ Campo válido
```
┌────────────────────────────┐
│ Nombre del Producto *      │
│ ┌──────────────────────────┐│
│ │ Camiseta Estampada      ││
│ └──────────────────────────┘│
│ ✓ Campo completado          │
└────────────────────────────┘
```

### ❌ Error de validación
```
┌────────────────────────────┐
│ Precio de Venta *          │
│ ┌──────────────────────────┐│
│ │ $ 0.00                  ││
│ └──────────────────────────┘│
│ ⚠️  El precio debe ser > 0   │
└────────────────────────────┘
```

## Características del Dark Mode 🌙

El componente automáticamente cambia:
- **Fondos**: Blanco → Gris oscuro
- **Texto**: Gris oscuro → Blanco
- **Bordes**: Gris claro → Gris oscuro
- **Acentos**: Mantienen su saturación

### Ejemplo en Ambos Modos:

```
MODO CLARO              MODO OSCURO
┌─────────────────┐    ┌─────────────────┐
│ 🔵 (azul)      │    │ 🔵 (azul oscuro)│
│ Blanco ████    │    │ Gris ████       │
│ Gris oscuro     │    │ Blanco          │
└─────────────────┘    └─────────────────┘
```

## Flujo de Navegación

```
START
  ↓
[Paso 1: Básica] → Validar nombre, código, categoría
  ↓
[Paso 2: Detalles] → Validar descripción
  ↓
[Paso 3: Precios] → Validar precios > 0
  ↓
[Paso 4: Imágenes] → Validar imagen principal
  ↓
[Paso 5: Resumen] → Preview final
  ↓
[Guardar] → API Call
  ↓
✅ ÉXITO / ❌ ERROR (mensaje)
  ↓
CLOSE MODAL
```

## Ejemplos de Mensajes

### Error
```
┌─────────────────────────────────────┐
│ ⚠️  El nombre del producto es      │
│     requerido                       │
└─────────────────────────────────────┘
```

### Éxito
```
┌─────────────────────────────────────┐
│ ✓ Revisa los datos antes de        │
│   guardar. Asegúrate de que...      │
└─────────────────────────────────────┘
```

---

## Tips de Uso 💡

1. **Buscar categorías**: Empieza a escribir en el campo de búsqueda
2. **Calcular precios**: Usa los botones +15%, +25%, +30%
3. **Subir múltiples imágenes**: Selecciona varias a la vez
4. **Revisar antes de guardar**: El paso 5 muestra todo
5. **Modo oscuro**: Automático según tu preferencia del sistema
