# Troubleshooting - Wizard de Productos 🔧

## Problemas Comunes y Soluciones

### 1. El Wizard No Se Abre

**Síntoma**: El botón "Crear Producto" no abre el modal

**Soluciones**:

```jsx
// ❌ INCORRECTO
<ProductosWizard producto={producto} />

// ✅ CORRECTO
<ProductosWizard 
  isOpen={mostrarWizard}
  onClose={() => setMostrarWizard(false)}
  producto={productoEditando}
  onSuccess={() => fetchProductos()}
/>
```

**Verificar**:
- [ ] ¿Está `mostrarWizard` en true?
- [ ] ¿Se está pasando `isOpen={mostrarWizard}`?
- [ ] ¿El estado se actualiza con `setMostrarWizard(true)`?

---

### 2. Las Categorías/Proveedores No Cargan

**Síntoma**: Los dropdowns quedan vacíos

**Posibles Causas**:

```javascript
// ❌ Error en API
const response = await categoriasApi.obtenerCategorias();
// El response puede no tener .datos

// ✅ Verificar estructura
const categoriasArray = response.datos || response.data || response || [];
```

**Solución**:
```javascript
// En WizardStep1.jsx y WizardStep2.jsx
useEffect(() => {
  const fetchCategorias = async () => {
    try {
      const response = await categoriasApi.obtenerCategorias();
      // Soportar múltiples estructuras de respuesta
      const categorias = response.datos || response.data || response || [];
      console.log('Categorías recibidas:', categorias); // Debug
      setCategorias(Array.isArray(categorias) ? categorias : []);
    } catch (error) {
      console.error('Error detallado:', error);
    }
  };
  fetchCategorias();
}, []);
```

**Verificar en Console**:
```javascript
// Ejecutar en DevTools
await fetch('http://localhost:3000/api/categorias')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

### 3. Las Imágenes No Se Guardan

**Síntoma**: El producto se crea pero sin imágenes

**Causa**: El wizard solo valida, la carga real es en la API

**Solución**:
```javascript
// En ProductosWizard.jsx - handleSubmit
const dataToSubmit = {
  nombreProducto: formData.nombreProducto,
  // ...otros campos...
  estado: 'activo'
  // Las imágenes se manejan por separado
};

// Si necesitas guardar imágenes automáticamente:
if (formData.imagenPrincipal) {
  // Crear nuevo producto primero
  const producto = await productosApi.createProducto(dataToSubmit);
  
  // Luego subir imagen
  const imagenFormData = new FormData();
  imagenFormData.append('imagen', formData.imagenPrincipal);
  await imagenesApi.createImagenProducto(producto.idProducto, imagenFormData);
}
```

---

### 4. Dark Mode No Funciona

**Síntoma**: El componente se ve igual en claro y oscuro

**Causa**: ThemeContext no está disponible

**Verificar**:
```jsx
// En App.jsx debe estar el ThemeProvider
<ThemeProvider>
  <ProductosWizard {...props} />
</ThemeProvider>
```

**Debug**:
```javascript
// Añadir en ProductosWizard.jsx
console.log('Clases dark:',
  document.documentElement.classList.contains('dark')
);
```

**Solución**: Asegurar que el ThemeProvider esté en el nivel más alto

---

### 5. Los Botones No Responden

**Síntoma**: Clickear en botones no hace nada

**Causa Común**: Evento onClick no está asignado

```jsx
// ❌ INCORRECTO
<button onClick="handleNext">Siguiente</button>

// ✅ CORRECTO
<button onClick={handleNext}>Siguiente</button>
```

**Verificar**:
- [ ] ¿Está usando `onClick={}` (función)?
- [ ] ¿La función está definida?
- [ ] ¿No hay errores en console?

---

### 6. Los Precios No Calculan Automáticamente

**Síntoma**: El margen no se actualiza

**Verificar en Step 3**:
```jsx
// Debe estar en useEffect
useEffect(() => {
  if (precioCompra > 0) {
    const porcentaje = ((precioVenta - precioCompra) / precioCompra) * 100;
    setGanancia(porcentaje.toFixed(2));
    onUpdateFormData({ porcentajeGanancia: porcentaje.toFixed(2) });
  }
}, [precioCompra, precioVenta]); // ← Dependencias importantes
```

---

### 7. No Se Puede Avanzar de Pasos

**Síntoma**: El botón "Siguiente" no funciona

**Causa**: Validación falla

**Debug**:
```javascript
// En ProductosWizard.jsx
const handleNext = () => {
  console.log('Validando paso:', pasoActual);
  if (validateStep(pasoActual)) {
    console.log('Validación OK, avanzando');
    setPasoActual(prev => Math.min(prev + 1, 5));
  } else {
    console.log('Validación falló:', error);
  }
};
```

**Verificar datos requeridos**:
- Paso 1: nombre, código, categoría
- Paso 2: descripción
- Paso 3: precioCompra > 0, precioVenta > 0
- Paso 4: imagenPrincipal

---

### 8. Error: "Cannot read property 'datos' of undefined"

**Causa**: Respuesta de API no es lo esperado

**Solución**:
```javascript
// Siempre validar respuesta
try {
  const response = await categoriasApi.obtenerCategorias();
  
  // Múltiples capas de validación
  const datos = response?.datos || 
                response?.data || 
                response;
  
  if (!Array.isArray(datos)) {
    console.warn('Respuesta no es array:', datos);
    return [];
  }
  
  setCategorias(datos);
} catch (error) {
  console.error('Error:', error.message);
  setCategorias([]);
}
```

---

### 9. Imágenes Se Vuelven Grandes en Upload

**Síntoma**: Las imágenes tarddan mucho en subir

**Solución**: Comprimir antes de subir

```jsx
// En WizardStep4.jsx
const compressImage = async (file) => {
  // Usar una librería como browser-image-compression
  // o redimensionar manualmente
  
  if (file.size > 2 * 1024 * 1024) {
    console.warn('Imagen grande, considerar comprimir');
  }
};
```

---

### 10. El Modal Se Cierra Pero Los Datos Persisten

**Causa**: Los estados no se limpian

**Solución**:
```jsx
// En ProductosWizard.jsx
const handleCloseModal = () => {
  // Limpiar todos los estados
  setPasoActual(1);
  setFormData({
    nombreProducto: '',
    codigoReferencia: '',
    // ...
  });
  setError(null);
  onClose(); // Callback al padre
};
```

---

## Errors Comunes en Console

### Error 1: "Tailwind classes not applied"

```
⚠️  dark:bg-gray-900 no se aplica

Solución:
1. Verificar que Tailwind está compilado
2. Reiniciar servidor dev
3. Verificar tailwind.config.js incluye el archivo
```

### Error 2: "Lucide icon not rendering"

```
⚠️  Las X, Plus, etc. no aparecen

Solución:
import { Plus } from 'lucide-react';
// No olvides el import
```

### Error 3: "API call failed"

```
⚠️  Error al obtener categorías

Solución:
1. Verificar que el backend está corriendo
2. Verificar URLs en config de API
3. Verificar autenticación/tokens
4. Ver logs del servidor
```

---

## Debugging Tips 🔍

### 1. Usar Console.log

```javascript
// En cada función importante
const handleNext = () => {
  console.log('Estado actual:', {
    pasoActual,
    formData,
    error
  });
  // ...
};
```

### 2. Usar React DevTools

- Instalar extensión en Chrome
- Inspeccionar componentes
- Ver props y estado en tiempo real

### 3. Usar Network Tab

```javascript
// F12 → Network
// Ver las llamadas a API
// Verificar status (200, 404, 500)
// Ver payload enviado y recibido
```

### 4. Breakpoints en DevTools

```javascript
// Pausar ejecución
// F12 → Sources
// Click en número de línea
// Inspeccionar variables en ese punto
```

---

## Testing Quick Check ✅

```bash
# Antes de reportar un bug, verificar:

□ ¿El servidor backend está corriendo? (localhost:3000)
□ ¿La consola muestra errores? (F12)
□ ¿Los imports están correctos?
□ ¿Las props se pasan correctamente?
□ ¿El estado se actualiza? (React DevTools)
□ ¿La API responde correctamente? (Network tab)
□ ¿El Tailwind está compilado?
□ ¿Estoy usando la última versión del código?

# Si todo es "Sí", entonces es un bug real
```

---

## Reportar Bugs 🐛

Cuando reportes un bug, incluye:

1. **Descripción clara**: Qué no funciona
2. **Pasos para reproducir**: Cómo hacerlo fallar
3. **Resultado esperado**: Qué debería pasar
4. **Resultado actual**: Qué pasa en realidad
5. **Screenshots/Videos**: Si es visual
6. **Console errors**: Copy-paste de DevTools
7. **Navegador/OS**: Dónde ocurre

**Ejemplo**:
```
Bug: No puedo avanzar del paso 1

Pasos:
1. Click en "Crear Producto"
2. Ingresar nombre: "Test"
3. Ingresar código: "TEST-001"
4. Seleccionar categoría
5. Click en "Siguiente"

Esperado: Avanzar al paso 2
Actual: Botón "Siguiente" deshabilitado

Error en console:
"Cannot read property 'trim' of null"

Navegador: Chrome 120
OS: Windows 11
```

---

## Performance Issues 🚀

Si el wizard es lento:

```javascript
// 1. Memoizar componentes
import { memo } from 'react';
const WizardStep1 = memo(function WizardStep1(props) {
  // ...
});

// 2. Usar useCallback
const handleNext = useCallback(() => {
  // ...
}, [dependencies]);

// 3. Memoizar valores
const categoriaSeleccionada = useMemo(() => {
  return categorias.find(cat => cat.id === selected);
}, [categorias, selected]);
```

---

## Preguntas Frecuentes 🤔

**P: ¿Puedo cambiar los colores?**
A: Sí, modifica las clases de Tailwind (blue-600 → green-600, etc.)

**P: ¿Puedo agregar más pasos?**
A: Sí, crea un nuevo WizardStep6.jsx y actualiza el componente principal

**P: ¿Se pueden guardar borradores?**
A: Sí, guarda formData en localStorage antes de onClose

**P: ¿Funciona en móvil?**
A: Sí, es completamente responsive

**P: ¿Necesito cambiar la API?**
A: No, el wizard es agnóstico de API

---

**¡Espero que esto ayude! Si tienes más problemas, revisa los logs y la consola.** 🚀
