# Componente Wizard para Crear Productos 🚀

## Descripción General

Se ha implementado un moderno **componente Wizard paso a paso** para la creación y edición de productos con una UX amigable, intuitiva y con soporte completo para **modo claro y oscuro**.

## Características Principales ✨

### 🎯 5 Pasos Intuitivos

1. **Paso 1: Información Básica**
   - Nombre del producto
   - Código de referencia
   - Selección de categoría con búsqueda

2. **Paso 2: Detalles y Proveedor**
   - Descripción detallada
   - Selección de proveedor (opcional)
   - Unidad de medida con botones de selección rápida

3. **Paso 3: Precios**
   - Precio de compra y venta
   - Cálculo automático de margen y porcentaje
   - Calculadora rápida (+15%, +25%, +30%)
   - Indicadores visuales de ganancia

4. **Paso 4: Imágenes**
   - Upload de imagen principal (requerida)
   - Múltiples imágenes adicionales
   - Preview en tiempo real
   - Validación de tamaño y formato

5. **Paso 5: Resumen**
   - Revisión de todos los datos
   - Preview de imagen
   - Confirmación antes de guardar

### 🎨 Diseño Moderno

- **Gradientes profesionales** en headers y botones
- **Indicadores visuales** de progreso (pasos completados)
- **Transiciones suaves** en todos los elementos
- **Iconos representativos** para cada paso
- **Validación en tiempo real** con mensajes claros

### 🌙 Soporte Dark/Light Mode

Todo el componente incluye:
- Clases `dark:` de Tailwind CSS
- Colores adaptables a ambos temas
- Contraste óptimo en ambos modos
- Transiciones suaves entre temas

### 📱 Responsive Design

- Diseño completamente adaptable
- Optimizado para móviles, tablets y desktop
- Layout flexible con Tailwind Grid

### ✅ Validaciones Inteligentes

- Campo requerido: nombre del producto
- Campo requerido: código de referencia único
- Selección obligatoria de categoría
- Validación de precios (deben ser > 0)
- Imagen principal obligatoria
- Mensajes de error descriptivos

### 🔧 Funcionalidades Adicionales

- **Edición de productos existentes**: Precarga todos los datos
- **Cálculo automático de márgenes**: Se actualiza en tiempo real
- **Búsqueda en dropdowns**: Categorías y proveedores
- **Histórico de cambios**: Indicador visual de progreso
- **Gestión de múltiples imágenes**: Upload y vista previa

## Estructura de Archivos 📁

```
src/
├── components/
│   └── admin/
│       ├── ProductosWizard.jsx (componente principal)
│       └── wizard-steps/
│           ├── WizardStep1.jsx (Información Básica)
│           ├── WizardStep2.jsx (Detalles y Proveedor)
│           ├── WizardStep3.jsx (Precios)
│           ├── WizardStep4.jsx (Imágenes)
│           └── WizardStep5.jsx (Resumen)
└── pages/
    └── admin/
        └── productos/
            └── ProductosPage.jsx (integración)
```

## Uso 🚀

### Importar el Componente

```jsx
import ProductosWizard from '../../../components/admin/ProductosWizard';
```

### Implementar en tu Página

```jsx
import { useState } from 'react';

export default function ProductosPage() {
  const [mostrarWizard, setMostrarWizard] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  return (
    <div>
      {/* Botón para abrir wizard */}
      <button onClick={() => setMostrarWizard(true)}>
        Crear Producto
      </button>

      {/* Wizard Modal */}
      <ProductosWizard
        isOpen={mostrarWizard}
        onClose={() => {
          setMostrarWizard(false);
          setProductoEditando(null);
        }}
        producto={productoEditando}
        onSuccess={() => {
          // Recargar productos aquí
        }}
      />
    </div>
  );
}
```

### Props del Componente

| Prop | Tipo | Descripción |
|------|------|-------------|
| `isOpen` | boolean | Controla si el modal está visible |
| `onClose` | function | Callback al cerrar el modal |
| `producto` | object (opcional) | Producto a editar (si no se proporciona, es crear) |
| `onSuccess` | function (opcional) | Callback al guardar exitosamente |

## Flujo de Datos 📊

```
ProductosPage (Estado: mostrarFormulario, productoEditando)
    ↓
ProductosWizard (Recibe props e isOpen)
    ↓
Componentes de Pasos (WizardStep1, WizardStep2, etc.)
    ↓
Validación + API Call (productosApi.createProducto/updateProducto)
    ↓
onSuccess callback → Recarga de datos
```

## Temas de Color 🎨

### Modo Claro
- Headers: Azul (#3B82F6)
- Fondos: Blanco/Gris claro
- Texto: Gris oscuro

### Modo Oscuro
- Headers: Azul oscuro (#1E3A8A)
- Fondos: Gris oscuro (#111827)
- Texto: Blanco/Gris claro

## Mejoras Implementadas 🔧

✅ Wizard paso a paso vs formulario tradicional
✅ Prevalidación antes de avanzar
✅ Indicadores visuales de progreso
✅ Búsqueda en catálogos (categorías, proveedores)
✅ Cálculo automático de márgenes
✅ Dark mode compatible
✅ Imágenes con preview
✅ Mensajes de error claros
✅ Resumen final antes de guardar
✅ Responsive design

## Próximas Mejoras Opcionales 💡

- [ ] Agregar campos para colores y tallas en el wizard
- [ ] Exportar/guardar borrador en localStorage
- [ ] Historial de cambios
- [ ] Duplicar producto existente
- [ ] Importar productos en bulk

## API Required 🔌

El componente requiere que tengas estas funciones en tu API:

```javascript
// productosApi
productosApi.createProducto(data)
productosApi.updateProducto(id, data)

// categoriasApi
categoriasApi.obtenerCategorias()

// proveedoresApi
proveedoresApi.obtenerProveedores()
```

## Notas Importantes ⚠️

- El componente usa Tailwind CSS para estilos
- Requiere lucide-react para iconos
- Compatible con React 16.8+
- Soporta modo oscuro a través de ThemeContext existente

---

**¡El componente está listo para usar! 🎉**
