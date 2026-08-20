# Deploy del Backend en Railway

El backend es una API Node.js con Prisma y PostgreSQL. En producción se
despliega en **Railway** y la base de datos usa el **PostgreSQL gestionado** de Railway.

---

## Estado actual (ya preparado, en ejecución)

- **Proyecto**: `desirable-perfection` (workspace `alejostone1's Projects`)
- **Servicio API**: `api` → dominio público `https://api-production-cdcd.up.railway.app`
- **Base de datos**: Postgres gestionado (creado), volumen `postgres-volume-W_SM`
- **Variables del servicio `api`** ya definidas:
  | Variable | Valor |
  |---|---|
  | `DATABASE_URL` | Cadena interna de Railway (`postgresql://postgres:...@postgres.railway.internal:5432/railway`) |
  | `JWT_SECRET` | Secreto aleatorio de 64 hex (solo en Railway, nunca en Git) |
  | `CORS_ORIGIN` | `https://adiestilos-full.vercel.app` |
  | `NODE_ENV` | `production` |
  | `CLOUDINARY_*` | **Pendiente** — añádelas cuando tengas las keys (ver `docs/CLOUDINARY.md`) |
- **`Backend/railway.json`**: builder Nixpacks, start `npx prisma migrate deploy && node src/server.js`, healthcheck `GET /health`, restart ON_FAILURE.

## Desplegar / re-desplegar (CLI)

```bash
railway link -p d72cdec3-5365-4ca1-9ea9-5df7e44d64b9 -e 76bbc320-5f89-4bb6-ab9b-7b41e6960e14 -s 542d3605-1011-450a-9ceb-a0b6b24397f3
cd Backend
railway up
```

> ⚠️ **Plan gratuito (Hobby):** Railway solo despliega a `us-west2` y lo bloquea en
> **horas pico (08:00–20:00 hora de Los Ángeles)**. Si te sale ese mensaje, reintenta
> después de las 20:00 LA. La única alternativa es subir de plan.

## 1. Crear el proyecto (si se hiciera desde cero)

1. `railway login`
2. `railway init --name <proyecto>`
3. `railway add --database postgres` → copia el `DATABASE_URL` interno del servicio Postgres:
   `railway variable list --json --service <id-postgres>`
4. `railway add --service api`
5. `railway variable set --service <id-api> "DATABASE_URL=..." "JWT_SECRET=..." "NODE_ENV=production" "CORS_ORIGIN=TU-FRONTEND.vercel.app"`

## Variables del servicio Backend (tabla de referencia)

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La Connection String interna del PostgreSQL de Railway |
| `JWT_SECRET` | Secreto largo (mínimo 32 caracteres) — genera uno aleatorio |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://TU-FRONTEND.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Tu Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Tu Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Tu Cloudinary API Secret |
| `CLOUDINARY_FOLDER` | `adi-estilos` |

## Migraciones y datos

- Las migraciones de `prisma/migrations/` se aplican automáticamente en cada
  arranque (`npx prisma migrate deploy` antes de `node src/server.js`).
- Para sembrar datos **una sola vez** contra la BD de producción:

  ```bash
  railway run --service <id-api> npx prisma db seed
  ```

## Notas

- **El sistema de archivos de Railway es efímero**: **no** sirvas imágenes desde
  `/uploads` en producción. Por eso se usa **Cloudinary**: cada subida queda en la
  nube y la URL se guarda en la base de datos. Sin Cloudinary, las subidas se
  pierden al reiniciar el servicio.
- El despliegue ignora variables locales: todo se define con `railway variable set`
  o en el panel de Railway.