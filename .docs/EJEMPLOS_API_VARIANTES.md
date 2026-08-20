# 🧪 Ejemplos de Requests y Responses - API de Variantes

## Índice
1. [Crear Variante](#crear-variante)
2. [Obtener Variantes por Producto](#obtener-variantes-por-producto)
3. [Obtener Variante por ID](#obtener-variante-por-id)
4. [Actualizar Variante](#actualizar-variante)
5. [Casos de Error](#casos-de-error)

---

## Crear Variante

### Request
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 1,
  "codigoSku": "CAM-ROJO-M",
  "idColor": 5,
  "idTalla": 2,
  "precioCosto": 5000,
  "precioVenta": 15000,
  "cantidadStock": 50,
  "stockMinimo": 10,
  "stockMaximo": 200
}
```

### Response 201 (Exitoso)
```json
{
  "statusCode": 201,
  "message": "Variante creada exitosamente.",
  "data": {
    "idVariante": 42,
    "idProducto": 1,
    "idColor": 5,
    "idTalla": 2,
    "codigoSku": "CAM-ROJO-M",
    "precioCosto": 5000,
    "precioVenta": 15000,
    "margen": 10000,
    "margenPorcentaje": 66.67,
    "cantidadStock": 50,
    "stockMinimo": 10,
    "stockMaximo": 200,
    "estado": "activo",
    "color": {
      "idColor": 5,
      "nombreColor": "Rojo",
      "codigoHex": "#FF0000"
    },
    "talla": {
      "idTalla": 2,
      "nombreTalla": "M"
    },
    "creadoEn": "2026-01-29T10:30:00.000Z",
    "actualizadoEn": "2026-01-29T10:30:00.000Z"
  }
}
```

---

## Obtener Variantes por Producto

### Request
```http
GET /api/variantes?productoId=1
Authorization: Bearer {token}
```

### Response 200 (Exitoso)
```json
{
  "statusCode": 200,
  "message": "Variantes listadas exitosamente.",
  "data": [
    {
      "idVariante": 42,
      "idProducto": 1,
      "codigoSku": "CAM-ROJO-M",
      "precioCosto": 5000,
      "precioVenta": 15000,
      "margen": 10000,
      "margenPorcentaje": 66.67,
      "cantidadStock": 50,
      "stockMinimo": 10,
      "stockMaximo": 200,
      "estado": "activo",
      "color": {
        "idColor": 5,
        "nombreColor": "Rojo",
        "codigoHex": "#FF0000"
      },
      "talla": {
        "idTalla": 2,
        "nombreTalla": "M"
      },
      "producto": {
        "idProducto": 1,
        "nombreProducto": "Camisa"
      },
      "creadoEn": "2026-01-29T10:30:00.000Z",
      "actualizadoEn": "2026-01-29T10:30:00.000Z"
    },
    {
      "idVariante": 43,
      "idProducto": 1,
      "codigoSku": "CAM-AZUL-M",
      "precioCosto": 4500,
      "precioVenta": 14000,
      "margen": 9500,
      "margenPorcentaje": 67.86,
      "cantidadStock": 75,
      "stockMinimo": 10,
      "stockMaximo": 200,
      "estado": "activo",
      "color": {
        "idColor": 6,
        "nombreColor": "Azul",
        "codigoHex": "#0000FF"
      },
      "talla": {
        "idTalla": 2,
        "nombreTalla": "M"
      },
      "producto": {
        "idProducto": 1,
        "nombreProducto": "Camisa"
      },
      "creadoEn": "2026-01-29T11:15:00.000Z",
      "actualizadoEn": "2026-01-29T11:15:00.000Z"
    },
    {
      "idVariante": 44,
      "idProducto": 1,
      "codigoSku": "CAM-ROJO-L",
      "precioCosto": 6000,
      "precioVenta": 16000,
      "margen": 10000,
      "margenPorcentaje": 62.5,
      "cantidadStock": 30,
      "stockMinimo": 10,
      "stockMaximo": 200,
      "estado": "activo",
      "color": {
        "idColor": 5,
        "nombreColor": "Rojo",
        "codigoHex": "#FF0000"
      },
      "talla": {
        "idTalla": 3,
        "nombreTalla": "L"
      },
      "producto": {
        "idProducto": 1,
        "nombreProducto": "Camisa"
      },
      "creadoEn": "2026-01-29T12:00:00.000Z",
      "actualizadoEn": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

---

## Obtener Variante por ID

### Request
```http
GET /api/variantes/42
Authorization: Bearer {token}
```

### Response 200 (Exitoso)
```json
{
  "statusCode": 200,
  "message": "Variante obtenida exitosamente.",
  "data": {
    "idVariante": 42,
    "idProducto": 1,
    "idColor": 5,
    "idTalla": 2,
    "codigoSku": "CAM-ROJO-M",
    "precioCosto": 5000,
    "precioVenta": 15000,
    "margen": 10000,
    "margenPorcentaje": 66.67,
    "cantidadStock": 50,
    "stockMinimo": 10,
    "stockMaximo": 200,
    "estado": "activo",
    "color": {
      "idColor": 5,
      "nombreColor": "Rojo",
      "codigoHex": "#FF0000"
    },
    "talla": {
      "idTalla": 2,
      "nombreTalla": "M"
    },
    "producto": {
      "idProducto": 1,
      "nombreProducto": "Camisa",
      "codigoReferencia": "PROD-001"
    },
    "imagenesVariantes": [
      {
        "idImagenVariante": 1,
        "rutaImagen": "/uploads/variantes/cam-rojo-m-01.jpg",
        "descripcion": "Vista frontal",
        "orden": 0,
        "esPrincipal": true
      }
    ],
    "creadoEn": "2026-01-29T10:30:00.000Z",
    "actualizadoEn": "2026-01-29T10:30:00.000Z"
  }
}
```

---

## Actualizar Variante

### Request
```http
PUT /api/variantes/42
Content-Type: application/json
Authorization: Bearer {token}

{
  "precioVenta": 16000,
  "precioCosto": 5500,
  "cantidadStock": 45
}
```

### Response 200 (Exitoso)
```json
{
  "statusCode": 200,
  "message": "Variante actualizada exitosamente.",
  "data": {
    "idVariante": 42,
    "idProducto": 1,
    "idColor": 5,
    "idTalla": 2,
    "codigoSku": "CAM-ROJO-M",
    "precioCosto": 5500,
    "precioVenta": 16000,
    "margen": 10500,
    "margenPorcentaje": 65.63,
    "cantidadStock": 45,
    "stockMinimo": 10,
    "stockMaximo": 200,
    "estado": "activo",
    "color": {
      "idColor": 5,
      "nombreColor": "Rojo",
      "codigoHex": "#FF0000"
    },
    "talla": {
      "idTalla": 2,
      "nombreTalla": "M"
    },
    "creadoEn": "2026-01-29T10:30:00.000Z",
    "actualizadoEn": "2026-01-29T14:45:00.000Z"
  }
}
```

---

## Casos de Error

### ❌ Error 400: Campos obligatorios faltantes

**Request:**
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 1,
  "codigoSku": "CAM-ROJO-M"
  // Faltan: precioCosto y precioVenta
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "Los campos \"idProducto\", \"codigoSku\", \"precioVenta\" y \"precioCosto\" son obligatorios.",
  "error": "BAD_REQUEST"
}
```

---

### ❌ Error 400: precioCosto inválido (negativo)

**Request:**
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 1,
  "codigoSku": "CAM-ROJO-M",
  "precioCosto": -5000,
  "precioVenta": 15000
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "precioCosto debe ser un número mayor o igual a 0.",
  "error": "VALIDATION_ERROR"
}
```

---

### ❌ Error 400: precioVenta inválido (cero o negativo)

**Request:**
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 1,
  "codigoSku": "CAM-ROJO-M",
  "precioCosto": 5000,
  "precioVenta": 0
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "precioVenta debe ser un número mayor a 0.",
  "error": "VALIDATION_ERROR"
}
```

---

### ❌ Error 400: Margen negativo

**Request:**
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 1,
  "codigoSku": "CAM-ROJO-M",
  "precioCosto": 15000,
  "precioVenta": 5000
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "precioVenta debe ser mayor que precioCosto. El margen debe ser positivo.",
  "error": "VALIDATION_ERROR"
}
```

---

### ❌ Error 409: Variante duplicada

**Request:**
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 1,
  "idColor": 5,
  "idTalla": 2,
  "codigoSku": "CAM-ROJO-M-NUEVO",
  "precioCosto": 5000,
  "precioVenta": 15000
}
```

**Response (si ya existe combinación producto-color-talla):**
```json
{
  "statusCode": 409,
  "message": "Ya existe una variante con la misma combinación de producto, color y talla.",
  "error": "CONFLICT"
}
```

---

### ❌ Error 409: SKU duplicado

**Request:**
```http
POST /api/variantes
Content-Type: application/json
Authorization: Bearer {token}

{
  "idProducto": 2,
  "codigoSku": "CAM-ROJO-M",
  "precioCosto": 5000,
  "precioVenta": 15000
}
```

**Response (si el SKU ya existe en otra variante):**
```json
{
  "statusCode": 409,
  "message": "Ya existe una variante con el mismo SKU.",
  "error": "CONFLICT"
}
```

---

### ❌ Error 404: Variante no encontrada

**Request:**
```http
GET /api/variantes/99999
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "Variante no encontrada.",
  "error": "NOT_FOUND"
}
```

---

### ❌ Error 404: Variante no encontrada para actualizar

**Request:**
```http
PUT /api/variantes/99999
Content-Type: application/json
Authorization: Bearer {token}

{
  "precioVenta": 20000
}
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "Variante no encontrada para actualizar.",
  "error": "NOT_FOUND"
}
```

---

### ❌ Error 400: ID inválido (no es número)

**Request:**
```http
GET /api/variantes/abc
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": "El ID proporcionado no es un número válido.",
  "error": "BAD_REQUEST"
}
```

---

## 📊 Tabla Comparativa de Variantes

Para mostrar en Frontend:

| SKU | Producto | Color | Talla | Costo | Venta | Margen | Margen % | Stock |
|-----|----------|-------|-------|-------|-------|--------|----------|-------|
| CAM-ROJO-M | Camisa | Rojo | M | $5.000 | $15.000 | $10.000 | 66.67% | 50 |
| CAM-AZUL-M | Camisa | Azul | M | $4.500 | $14.000 | $9.500 | 67.86% | 75 |
| CAM-ROJO-L | Camisa | Rojo | L | $6.000 | $16.000 | $10.000 | 62.50% | 30 |

---

## 🔐 Headers Requeridos

```javascript
// En todas las requests:
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

---

## 📌 Notas Importantes

1. **Margen siempre es positivo:** El sistema valida que `precioVenta > precioCosto`
2. **precioCosto es obligatorio:** A partir de ahora es un campo requerido
3. **Margen se calcula automáticamente:** No se envía desde el cliente
4. **Margen porcentaje se calcula automáticamente:** No se envía desde el cliente
5. **Todos los decimales se manejan correctamente:** Los cálculos usan Decimal en BD

---

## 💾 Script de Prueba (cURL)

```bash
# Crear variante
curl -X POST http://localhost:3000/api/variantes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idProducto": 1,
    "codigoSku": "TEST-001",
    "idColor": 5,
    "idTalla": 2,
    "precioCosto": 5000,
    "precioVenta": 15000,
    "cantidadStock": 50
  }'

# Obtener variantes de producto
curl -X GET "http://localhost:3000/api/variantes?productoId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtener variante específica
curl -X GET http://localhost:3000/api/variantes/42 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Actualizar variante
curl -X PUT http://localhost:3000/api/variantes/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "precioVenta": 16000,
    "precioCosto": 5500
  }'
```

---

## 🧪 Casos de Prueba Recomendados

### Test 1: Crear variante válida
```javascript
✅ Esperar: 201 Created con margen calculado
```

### Test 2: Crear sin precioCosto
```javascript
❌ Esperar: 400 - campos obligatorios
```

### Test 3: Crear con margen negativo
```javascript
❌ Esperar: 400 - margen debe ser positivo
```

### Test 4: Crear con SKU duplicado
```javascript
❌ Esperar: 409 - SKU duplicado
```

### Test 5: Listar variantes de producto
```javascript
✅ Esperar: 200 OK con array de variantes
```

### Test 6: Obtener variante por ID
```javascript
✅ Esperar: 200 OK con datos completos
```

### Test 7: Actualizar variante
```javascript
✅ Esperar: 200 OK con datos actualizados
```
