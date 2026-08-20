# Cloudinary (almacenamiento de imágenes en producción)

En producción las imágenes **no** se guardan en el disco del servidor (Railway usa
un filesystem efímero). Todas las subidas se envían a **Cloudinary** y en la base
de datos se guarda la **URL remota** (`https://res.cloudinary.com/...`).

El frontend ya está preparado: el helper `src/utils/imageUrl.js` detecta URLs de
Cloudinary y las usa tal cual, y mantiene compatibilidad con las rutas `/uploads`
legacy del desarrollo.

---

## 1. Crear la cuenta y las claves

1. Crea una cuenta en **cloudinary.com** (plan gratuito disponible).
2. Ve a **Dashboard → Settings → Access Keys**.
3. Copia:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## 2. Configurar en el backend

En `Backend/.env` (desarrollo local) o como variables del servicio en Railway
(producción):

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=adi-estilos
```

## 3. Cómo funciona el código

- **`Backend/src/config/cloudinaryConfig.js`** — configura el SDK y detecta si las
  credenciales existen.
- **`Backend/src/services/cloudinaryService.js`**:
  - `guardarImagen(file, subdirectorio)` → sube el archivo de Multer a la carpeta
    `adi-estilos/<subdirectorio>` y devuelve la URL remota. Si Cloudinary no está
    configurado, devuelve la ruta local (`/uploads/...`) para desarrollo.
  - `borrarImagen(ruta)` → borra la imagen remota si la ruta es una URL de Cloudinary.
- Puntos de integración (sin cambiar endpoints):
  - `POST /api/imagenes/producto|variante/:id` → `imagenesService.crearImagen`
  - `POST /api/categorias/upload`
  - `POST /api/variantes/upload`
  - `POST /api/proveedores/upload`
  - Borrado automático en `imagenesService.eliminarImagen`.

## 4. Validación

Puedes probar la subida en local **sin** credenciales (fallback a `/uploads`).
Para probar contra Cloudinary real deja las variables puestas y sube una imagen
desde el panel de administración; en la respuesta verás una URL
`https://res.cloudinary.com/...` en el campo `url`.