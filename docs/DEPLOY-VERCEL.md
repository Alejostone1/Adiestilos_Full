# Deploy del Frontend en Vercel

El frontend es una SPA de React (Vite) que se compila a estáticos en **Vercel**.

---

## 1. Importar el repositorio

1. Entra a **vercel.com** → **Add New…** → **Project**.
2. Selecciona el repositorio `Adiestilos_Full` (rama `main`).

> ⚙️ **Importante:** el repositorio incluye un `vercel.json` en la raíz que ya
> configura **instalación, build y directorio de salida automáticamente**:
>
> ```json
> {
>   "installCommand": "npm install --prefix Frontend",
>   "buildCommand": "npm --prefix Frontend run build",
>   "outputDirectory": "Frontend/dist"
> }
> ```
>
> Por eso puedes importar el repo directamente (sin cambiar Root Directory).
> **Opción alternativa:** en **Settings → Root Directory** selecciona `Frontend`
> y deja el build por defecto (`npm run build`, salida `dist`).

## 2. Variables de entorno

Define en Vercel (**Settings → Environment Variables**):

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://TU-BACKEND.up.railway.app/api` |
| `VITE_FILES_URL` | `https://TU-BACKEND.up.railway.app` |
| `VITE_APP_NAME` | `Adi Estilos` |

> En las variables **hay que reemplazar `TU-BACKEND.up.railway.app` por la URL
> real** que te asignó Railway a tu servicio backend.

## 3. Deploy y rutas SPA

- Cada push a `main` dispara un deploy automático.
- Al ser una SPA con `BrowserRouter`, Vercel redirige automáticamente las rutas
  desconocidas a `index.html` (framework presets de Vite/React), así que las
  rutas tipo `/admin/ventas` funcionan al recargar.

---

## Notas

- **CORS**: el backend usa `CORS_ORIGIN`; asegúrate de incluir el dominio de Vercel
  (`.vercel.app` o dominio custom) o las llamadas al API serán bloqueadas por el navegador.
- Las imágenes de Cloudinary (`https://res.cloudinary.com/...`) se cargan directo
  desde la CDN, sin pasar por Vercel.
- `.env.production` local es solo un ejemplo; las variables reales viven en el panel de Vercel.