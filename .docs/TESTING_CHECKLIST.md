# Checklist de Testing - Wizard de Productos 🧪

## Testing Manual

### Paso 1: Información Básica ✅

- [ ] Al abrir, el formulario debe estar vacío
- [ ] El nombre se puede ingresar sin problemas
- [ ] El código se convierte a mayúsculas automáticamente
- [ ] La búsqueda de categoría filtra correctamente
- [ ] Se puede seleccionar una categoría
- [ ] No se puede avanzar sin nombre, código y categoría
- [ ] El error se muestra claramente cuando falta algo
- [ ] Se puede volver al paso 1 desde cualquier otro paso

### Paso 2: Detalles y Proveedor ✅

- [ ] Se puede ingresar descripción de múltiples líneas
- [ ] La búsqueda de proveedor funciona
- [ ] Se puede seleccionar proveedor o dejarlo sin seleccionar
- [ ] Los botones de unidad de medida funcionan
- [ ] Se muestra una unidad por defecto ("unidades")
- [ ] No se puede avanzar sin descripción
- [ ] El contador de caracteres se actualiza

### Paso 3: Precios ✅

- [ ] Se pueden ingresar precios decimales
- [ ] El margen se calcula automáticamente
- [ ] El porcentaje de ganancia se actualiza al cambiar precios
- [ ] Los botones de calculadora rápida funcionan (+15%, +25%, +30%)
- [ ] El indicador de ganancia cambia de color según el porcentaje
  - [ ] Rojo: sin ganancia
  - [ ] Naranja: ganancia baja (0-15%)
  - [ ] Amarillo: ganancia media (15-30%)
  - [ ] Verde: ganancia alta (30%+)
- [ ] No se puede avanzar con precios inválidos (0 o negativos)

### Paso 4: Imágenes ✅

- [ ] Se puede seleccionar una imagen principal
- [ ] El preview aparece inmediatamente
- [ ] Se muestra el nombre del archivo
- [ ] Se pueden agregar imágenes adicionales
- [ ] Las imágenes adicionales se muestran en grid
- [ ] Se puede eliminar una imagen adicional
- [ ] No se puede avanzar sin imagen principal
- [ ] Las validaciones de tamaño funcionan (máximo 5MB)
- [ ] Las validaciones de tipo funcionan (solo imágenes)

### Paso 5: Resumen ✅

- [ ] Se muestran todos los datos ingresados
- [ ] Las imágenes se previewan correctamente
- [ ] El contador de imágenes adicionales es correcto
- [ ] El resumen de precios es exacto
- [ ] El botón "Guardar Producto" está funcional
- [ ] Se muestra "Crear" o "Actualizar" según corresponda

## Testing de Navegación ✅

- [ ] Los botones "Anterior" y "Siguiente" funcionan
- [ ] El botón "Anterior" está deshabilitado en paso 1
- [ ] El botón "Siguiente" está deshabilitado si hay errores
- [ ] Se puede cerrar el modal con la X
- [ ] Al cerrar no se pierden datos (si se reabre)
- [ ] El indicador de pasos (1/5, 2/5, etc.) es correcto
- [ ] Las líneas conectoras entre pasos se actualizan

## Testing de Validación ✅

- [ ] Mostrar error claro: "El nombre del producto es requerido"
- [ ] Mostrar error claro: "El código de referencia es requerido"
- [ ] Mostrar error claro: "La categoría es requerida"
- [ ] Mostrar error claro: "La descripción es requerida"
- [ ] Mostrar error claro: "El precio de compra es requerido"
- [ ] Mostrar error claro: "El precio de venta es requerido"
- [ ] Mostrar error claro: "Debe subir al menos una imagen principal"
- [ ] Los errores se limpian al corregir

## Testing Dark Mode 🌙

- [ ] El componente se ve bien en modo claro
- [ ] El componente se ve bien en modo oscuro
- [ ] Los textos tienen contraste suficiente en ambos modos
- [ ] Los colores de botones son visibles en ambos modos
- [ ] Las transiciones entre temas son suaves
- [ ] Las imágenes se ven bien en ambos fondos

## Testing de Responsividad 📱

### Mobile (320px - 480px)
- [ ] El modal se adapta al tamaño de pantalla
- [ ] Los inputs son tocables (> 44px)
- [ ] El texto es legible
- [ ] No hay overflow horizontal
- [ ] Los botones están bien espaciados

### Tablet (481px - 768px)
- [ ] La distribución se ve bien
- [ ] Los campos están bien organizados
- [ ] El wizard ocupa el espacio correctamente

### Desktop (769px+)
- [ ] El modal tiene el tamaño correcto
- [ ] La distribución de columnas funciona
- [ ] Hay padding suficiente

## Testing de Edición ✅

- [ ] Al editar, se cargan los datos del producto
- [ ] Se puede cambiar el nombre
- [ ] Se puede cambiar la descripción
- [ ] Se pueden cambiar los precios
- [ ] El wizard respeta el estado "edición"
- [ ] El botón final dice "Guardar Producto" (no crear)

## Testing de API 🔌

- [ ] `categoriasApi.obtenerCategorias()` se llama correctamente
- [ ] `proveedoresApi.obtenerProveedores()` se llama correctamente
- [ ] `productosApi.createProducto()` se llama con datos correctos
- [ ] `productosApi.updateProducto()` se llama cuando se edita
- [ ] Se muestra loader mientras se guarda
- [ ] Los errores de API se muestran al usuario
- [ ] El modal se cierra al guardar exitosamente
- [ ] Se llama `onSuccess` callback después de guardar

## Testing de Accesibilidad ♿

- [ ] Los inputs tienen labels asociados
- [ ] Se pueden navegar con Tab
- [ ] Los botones se pueden presionar con Enter
- [ ] Los mensajes de error son claros
- [ ] El contraste de colores cumple WCAG AA
- [ ] El orden de tabulación es lógico

## Casos Edge Case 🔍

- [ ] Código con espacios en blanco
- [ ] Nombre muy largo (> 100 caracteres)
- [ ] Descripción muy larga (> 500 caracteres)
- [ ] Precio con muchos decimales
- [ ] Búsqueda sin resultados
- [ ] Intento de guardar sin conexión
- [ ] Cancelar en cada paso
- [ ] Cerrar sin guardar

## Performance ⚡

- [ ] El wizard carga rápido (< 1s)
- [ ] Las búsquedas responden sin lag
- [ ] Las imágenes cargan sin congelar
- [ ] El cambio de pasos es suave
- [ ] No hay memory leaks (verificar en DevTools)

## Integraciones ✅

- [ ] El wizard se abre con `mostrarFormulario = true`
- [ ] El wizard se cierra con `mostrarFormulario = false`
- [ ] Se pasan correctamente `producto` para edición
- [ ] El callback `onSuccess` funciona
- [ ] `fetchProductos()` se llama después de guardar
- [ ] La página principal se actualiza

---

## Notas Adicionales 📝

- Verificar que los estilos de Tailwind CSS se cargan correctamente
- Verificar que Lucide React icons se renderizan
- Verificar que el ThemeContext provee el modo oscuro
- Probar en diferentes navegadores (Chrome, Firefox, Safari, Edge)
- Probar en diferentes dispositivos

## Bugs Conocidos (si los hay) 🐛

_(Aquí documentar cualquier bug encontrado)_

- Ninguno reportado hasta ahora ✅

---

**Fecha de Testing**: _______________
**Testeado por**: _______________
**Navegador/OS**: _______________
**Resultado**: ✅ PASSED / ❌ FAILED
