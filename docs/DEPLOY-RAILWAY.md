# Deploy del Backend en Railway

El backend es una API Node.js con Prisma y PostgreSQL. En producción se
despliega en **Railway** y la base de datos usa el **PostgreSQL gestionado** de Railway.

---

## 1. Crear el proyecto

1. Entra a **railway.app** → **New Project** → **Empty Project** (o usa un template).
2. **Add a service** → **Provisión de base de datos** → **PostgreSQL**.
   - Railway te dará una **Connection String** del tipo `postgresql://postgres:...@.../railway`.

## 2. Desplegar el backend

1. **Add service** → **GitHub Repo** → selecciona tu repositorio y rama `main`.
2. Railway detecta la raíz: como el backend está en `Backend/`, define en el servicio:
   - **Root Directory**: `Backend`
   - **Start Command**: `npm run db:deploy && npm run start`
     (aplica migraciones de Prisma y luego arranca la API).
   - **Build Command**: (vacío) — Railway ya instala dependencias con `npm install`.

## 3. Variables de entorno del servicio Backend

En **Variables** del servicio agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La Connection String de tu PostgreSQL de Railway |
| `JWT_SECRET` | Secreto largo (mínimo 32 caracteres) — usa el generador de Railway |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://TU-FRONTEND.vercel.app` (el dominio de Vercel) |
| `CLOUDINARY_CLOUD_NAME` | Tu Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Tu Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Tu Cloudinary API Secret |
| `CLOUDINARY_FOLDER` | `adi-estilos` |
| `PORT` | `3000` |

## 4. Migraciones y datos

- Con el comando de arranque `npm run db:deploy && npm run start` las migraciones
  de `prisma/migrations/` se aplican automáticamente en cada deploy.
- Para sembrar datos **una sola vez** en producción, ejecuta en la consola de Railway (o local contra esa BD):

  ```bash
  DATABASE_URL="postgresql://..." npm start
  npx prisma db seed
  ```

---

## Notas

- **El sistema de archivos de Railway es efímero**: **no** sirvas imágenes desde
  `/uploads` en producción. Por eso se usa **Cloudinary**: cada subida queda en la
  nube y la URL se guarda en la base de datos.
- El despliegue ignora variables locales: todo se define en el panel de Railway.