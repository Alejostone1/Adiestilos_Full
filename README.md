# Adi Estilos 🛍️

Sistema de gestión comercial y tienda en línea. Plataforma completa para
administrar **productos, variantes, inventario, ventas, compras, créditos,
devoluciones, clientes, proveedores y reportes**, con un panel de administración
moderno y una vitrina pública para clientes.

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS + Ant Design |
| **Backend** | Node.js + Express + Prisma ORM |
| **Base de datos** | PostgreSQL 15 |
| **Imágenes** | Cloudinary (producción) / `/uploads` (desarrollo) |
| **Despliegue** | Vercel (frontend) + Railway (backend + PostgreSQL) |

---

## ✨ Características

- 🧩 **Catálogo jerárquico**: categorías, productos, variantes (color/talla), SKUs e imágenes.
- 📦 **Inventario** con stock mínimo, movimientos y ajustes.
- 🧾 **Ventas, compras, devoluciones y créditos** con detalle por línea.
- 👥 **Roles y permisos**: Administrador, Vendedor, Bodeguero y Cliente.
- 📊 **Dashboard y reportes** de ventas, inventario y créditos.
- 🖼️ **Galería de imágenes** (productos, variantes, categorías, proveedores).
- 🔐 **Autenticación JWT**, validación de roles y rate limiting.

---

## 🚀 Inicio rápido (desarrollo)

Requisitos: **Node 18+** y **PostgreSQL** corriendo en `localhost:5432`.

```bash
# 1. Instalar dependencias (raíz + Backend + Frontend)
npm run install:all

# 2. Crear tu .env del backend
cp Backend/.env.example Backend/.env
#    Editar Backend/.env y poner tu DATABASE_URL (ej: postgresql://postgres:CLAVE@localhost:5432/adiweb)

# 3. Crear el esquema de la BD y poblar datos de ejemplo
npm run db:migrate   # o: npm --prefix Backend run db:migrate
npm run db:seed      # usuarios demo, catálogo, etc.

# 4. ¡Levantar todo con UN solo comando!
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **API raíz:** http://localhost:3000/api

### 👤 Usuarios demo (creados por el seed)

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123*` |
| Vendedor | `vendedor` | `Vendedor123*` |
| Cliente | `cliente` | `Cliente123*` |

> ⚠️ Cambia estas contraseñas antes de ir a producción.

### 📜 Scripts raíz

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta backend + frontend juntos (concurrently) |
| `npm run install:all` | Instala dependencias de todo el proyecto |
| `npm run build` | Build de producción del frontend |
| `npm run db:migrate` / `db:deploy` / `db:seed` | Gestión de Prisma |

---

## 🗂️ Estructura del proyecto

```
├── Backend/            # API REST (Express + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de datos (30 modelos, 16 enums)
│   │   ├── migrations/         # Migraciones SQL (se versionan)
│   │   └── seeds/              # Seeds idempotentes (01-09, 10 usuarios, 20 productos)
│   └── src/
│       ├── config/             # Configuración central (servidor, BD, Cloudinary)
│       ├── modules/            # Módulos por dominio (auth, ventas, inventario, ...)
│       ├── services/           # Servicios reutilizables (cloudinaryService)
│       ├── middleware/         # auth, uploads (multer), validación, errores
│       └── app.js / server.js
├── Frontend/           # SPA React (Vite + Tailwind + Ant Design)
│   └── src/
│       ├── api/                # Clientes Axios por módulo
│       ├── components/         # Componentes reutilizables
│       ├── context/            # Contextos (auth, carrito)
│       ├── pages/              # Vistas (admin, cliente, público)
│       └── utils/              # helpers (imageUrl, permisos, formatos)
├── database/           # Backup SQL legacy (solo referencia; NO se monta en Postgres)
├── docs/               # Guías de despliegue
├── docker-compose.yml  # Orquestación local (opcional)
└── package.json        # Scripts raíz (npm run dev)
```

---

## 🚀 Despliegue a producción

- **[Backend + Base de datos → Railway](docs/DEPLOY-RAILWAY.md)** — PostgreSQL gestionado + migraciones automáticas.
- **[Frontend → Vercel](docs/DEPLOY-VERCEL.md)** — build estático + variables de entorno.
- **[Imágenes → Cloudinary](docs/CLOUDINARY.md)** — almacenamiento remoto de imágenes (requisito en producción).

### Variables de entorno (resumen)

**Backend** (Railway):
```
DATABASE_URL, JWT_SECRET, CORS_ORIGIN,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER
```

**Frontend** (Vercel):
```
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
VITE_FILES_URL=https://TU-BACKEND.up.railway.app
```

> Nunca subas archivos `.env` a Git. Solo se versionan los `.env.example`.

---

## 🧪 Verificación

- `prisma validate` y `prisma format --check` pasan sin errores.
- Los seeds son **idempotentes**: ejecutarlos varias veces no crea duplicados.
- Pruebas de humo: `POST /api/auth/login`, `GET /api/public/productos`, subida de imágenes.

## 📄 Licencia

Proyecto privado de Adi Estilos.
