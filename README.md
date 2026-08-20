<div align="center">

<!-- ══════════════════════════════════════════════════════════════════════ -->
<!--                         BANNER PRINCIPAL                               -->
<!-- ══════════════════════════════════════════════════════════════════════ -->

# ADI ESTILOS 🛍️

**Sistema de gestión comercial y tienda en línea para Adi Estilos**

*Gestiona · Vende · Controla tu inventario — todo en una sola plataforma*

<br/>

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-6-1677FF?style=flat-square&logo=antdesign)](https://ant.design/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Validado-22c55e?style=flat-square&logo=cloudinary)](https://cloudinary.com/)

<br/>

[![Estado](https://img.shields.io/badge/Estado-Producción_ready-22c55e?style=flat-square)](.)
[![Frontend](https://img.shields.io/badge/Frontend-Deployed_Vercel-181717?style=flat-square&logo=vercel)](https://adiestilos-full.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway_desplegado-181717?style=flat-square&logo=railway)](docs/DEPLOY-RAILWAY.md)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions)](.github/workflows/ci.yml)

<br/>

[🔴 Demo (Vercel)](#-despliegue) · [📖 Documentación](#-índice) · [🐛 Reportar Bug](../../issues) · [💡 Sugerir Feature](../../issues)

---

</div>

## 📋 Índice

- [Resumen ejecutivo](#-resumen-ejecutivo)
- [Capacidades principales](#-capacidades-principales)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y configuración](#-instalación-y-configuración)
- [Variables de entorno](#-variables-de-entorno)
- [Base de datos](#-base-de-datos)
- [Autenticación y roles](#-autenticación-y-roles)
- [Módulos del sistema](#-módulos-del-sistema)
- [API Reference](#-api-reference)
- [Manual de usuario](#-manual-de-usuario)
- [Sistema de diseño y UX](#-sistema-de-diseño-y-ux)
- [Performance y optimizaciones](#-performance-y-optimizaciones)
- [Despliegue](#-despliegue)
- [Verificación y QA](#-verificación-y-qa)
- [Roadmap](#-roadmap)
- [Créditos](#-créditos)

---

## 🎯 Resumen ejecutivo

**Adi Estilos** es una plataforma integral de **gestión comercial** para una tienda de ropa con **tienda en línea integrada**. Unifica en una sola aplicación la administración del negocio —productos y variantes (color/talla), inventario, compras a proveedores, ventas, créditos, pagos, descuentos y devoluciones— con una **vitrina pública** donde los clientes exploran el catálogo, arman su carrito y concretan el pedido vía **WhatsApp**.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│   "De la vitrina al mostrador: un solo sistema para            │
│    administrar, vender y controlar el negocio."                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

Es un **monorepo** con dos capas desacopladas: una **SPA en React (Vite)** en `Frontend/` y una **API REST en Node.js + Express** con **Prisma + PostgreSQL** en `Backend/`, lista para producción en **Vercel (frontend)** y **Railway (backend + BD)**, con imágenes en **Cloudinary**.

---

## ✨ Capacidades principales

| Capacidad | Descripción |
|---|---|
| 🧩 **Catálogo jerárquico** | Categorías anidadas → productos → variantes (color/talla) con **SKU único, precio de venta y de costo, y stock propios** |
| 📦 **Inventario completo** | Stock por variante, mínimos/máximos, **movimientos históricos de auditoría**, ajustes (mermas/correcciones) y tipos de movimiento configurables |
| 🧾 **Ventas y pagos** | Ventas de contado, mixtas y a crédito; facturación automática; **pagos iniciales, abonos y liquidación**; métodos de pago configurables (incl. **pagos mixtos**) |
| 💳 **Créditos a clientes** | Financiación por cliente, abonos, días de mora, límites y **resumen de crédito por cliente** en tiempo real |
| 📉 **Devoluciones** | Totales o parciales, desde líneas originales de venta, con estado del flujo (pendiente → procesada) |
| 🏷️ **Descuentos** | Porcentaje o valor fijo; por total de venta, categoría, producto o cliente; con código promocional, usos, fechas e historial auditado |
| 👥 **Roles y permisos** | Administrador, Vendedor, Bodeguero y Cliente con permisos granulares por rol (JSON) |
| 📊 **Dashboard y reportes** | KPIs del negocio y reportes de ventas, compras, inventario, créditos y pagos |
| 🖼️ **Galería de imágenes** | Productos, variantes, categorías y proveedores, con **subida directa a Cloudinary** y helper unificado de URLs |
| 🛒 **Tienda en línea** | Vitrina pública, carrito, detalle de producto con selector de color/talla y **checkout vía WhatsApp** |
| 🔐 **Seguridad** | **JWT** con expiración, contraseñas con **bcrypt**, validación de entradas, rate limiting y CORS configurable |

---

## 🔧 Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&style=flat-square&logoColor=black) | 18.2 | UI declarativa con hooks |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&style=flat-square&logoColor=white) | 5.2 | Bundler de desarrollo y build optimizado |
| ![Ant Design](https://img.shields.io/badge/-Ant_Design-1677FF?logo=antdesign&style=flat-square&logoColor=white) | 6.2 | Sistema de diseño + componentes (tablas, formularios, modales) |
| ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&style=flat-square&logoColor=white) | 3.4 | Utilidades CSS para la capa de estilos |
| ![React Router](https://img.shields.io/badge/-React_Router-6.23-CA4245?style=flat-square&logo=reactrouter) | 6.23 | Enrutamiento (rutas públicas, cliente y admin protegidas) |
| ![Recharts](https://img.shields.io/badge/-Recharts-3.6-22C55E?style=flat-square) | 3.6 | Gráficas del dashboard administrativo |
| ![Framer Motion](https://img.shields.io/badge/-Framer_Motion-12.24-FF0055?logo=framer&style=flat-square&logoColor=white) | 12.24 | Animaciones y transiciones de interfaz |
| ![Embla](https://img.shields.io/badge/-Embla_Carousel-8.6-539BFF?style=flat-square) | 8.6 | Carruseles de catálogo y galerías |
| ![Axios](https://img.shields.io/badge/-Axios-1.7-5A29E4?logo=axios&style=flat-square) | 1.7 | Cliente HTTP con interceptor de autenticación |
| ![SweetAlert2](https://img.shields.io/badge/-SweetAlert2-11-FF3B30?style=flat-square) | 11 | Confirmaciones y alertas |
| ![dayjs](https://img.shields.io/badge/-dayjs-1.11-FF6D00?style=flat-square) | 1.11 | Manejo de fechas |

### Backend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&style=flat-square&logoColor=white) | 18+ | Runtime del servidor |
| ![Express](https://img.shields.io/badge/-Express-4.19-000000?logo=express&style=flat-square&logoColor=white) | 4.19 | Framework HTTP, enrutado modular y middlewares |
| ![Prisma](https://img.shields.io/badge/-Prisma-5.22-2D3748?logo=prisma&style=flat-square&logoColor=white) | 5.22 | ORM type-safe, migraciones versionadas y seeds |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&style=flat-square&logoColor=white) | 15+ | Base de datos relacional |
| ![JWT](https://img.shields.io/badge/-JSON_Web_Token-9.0-000000?style=flat-square&logo=jsonwebtokens) | 9.0 | Tokens de acceso con expiración |
| ![bcryptjs](https://img.shields.io/badge/-bcryptjs-2.4-orange?style=flat-square) | 2.4 | Hash seguro de contraseñas |
| ![Multer](https://img.shields.io/badge/-Multer-2.0-00B4D8?style=flat-square) | 2.0 | Subida de archivos (multipart) |
| ![Cloudinary](https://img.shields.io/badge/-Cloudinary-2.10-3448C5?style=flat-square) | 2.10 | Almacenamiento remoto de imágenes |
| ![Helmet](https://img.shields.io/badge/-Helmet-7.1-000000?logo=helmet&style=flat-square&logoColor=white) | 7.1 | Cabeceras de seguridad (config listo, activable) |
| ![Morgan](https://img.shields.io/badge/-Morgan-1.10-000000?style=flat-square) | 1.10 | Logging de solicitudes HTTP |
| ![Express Validator](https://img.shields.io/badge/-Express_Validator-7.3-000000?style=flat-square) | 7.3 | Validación de payloads |

### DevTools e infraestructura

| Herramienta | Uso |
|-------------|-----|
| `concurrently` | Levantar backend + frontend con un solo comando (`npm run dev`) |
| `pnpm`/`npm workspaces` | Monorepo con scripts por carpeta (`npm --prefix`) |
| GitHub Actions | CI: `prisma validate/format --check/generate` + build frontend + verificador de imports |
| Vercel | Hosting del frontend (`vercel.json` con install, build y output automáticos) |
| Railway | Backend + PostgreSQL gestionado (`railway.json` con Nixpacks y healthcheck `/health`) |
| Cloudinary | CDN remoto de imágenes (subida + URLs firmadas) |

---

## 🏛️ Arquitectura del sistema

### Vista general (monorepo)

```mermaid
graph TB
    subgraph FE["🖥️ Frontend (Vite SPA)"]
        UI["React 18 + Ant Design + Tailwind"]
        CTX["AuthContext · CarritoContext · ThemeContext"]
        API["Cliente Axios por módulo (/src/api/*)"]
        IMG["Helper de imágenes (imageUrl.js)"]
    end

    subgraph BE["⚙️ Backend (Express + Prisma)"]
        R1["/api/auth"]
        R2["/api/public"]
        R3["/api/productos | variantes | categorias"]
        R4["/api/ventas | compras | inventario"]
        R5["/api/creditos | pagos | devoluciones"]
        R6["/api/galeria | imagenes | reportes"]
        MW["middleware: auth · validación · uploads"]
    end

    subgraph DB["🗄️ PostgreSQL"]
        ORM["Prisma Client"]
        PG[("30 modelos · 16 enums")]
    end

    UI --> CTX
    UI --> API
    API -->|"HTTP + Bearer JWT"| BE
    IMG -->|"https://res.cloudinary.com"| CDN["Cloudinary CDN"]

    R1 --> MW --> ORM
    R2 --> MW --> ORM
    R3 --> MW --> ORM
    R4 --> MW --> ORM
    R5 --> MW --> ORM
    R6 --> MW --> ORM
    ORM --> PG
```

### Flujo de autenticación (JWT)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (AuthContext)
    participant A as API /api/auth/login
    participant P as Prisma
    participant DB as PostgreSQL

    U->>F: Ingresa identificador + contraseña
    F->>A: POST /api/auth/login {identificador, contrasena}
    A->>P: findUnique(usuario | correo)
    P->>DB: SELECT usuario...
    DB-->>P: Usuario + hash bcrypt
    P-->>A: Usuario
    A->>A: bcrypt.compare() + estado activo
    A-->>F: 200 { tokenAcceso (JWT), usuario, rol }
    F->>F: Guarda token y datos en contexto + localStorage
    F-->>U: Redirige según rol (Admin→/admin, Cliente→/cliente, Vendedor→/ventas)
```

### Flujo de una venta (descuento de stock + crédito)

```mermaid
flowchart LR
    A([Vendedor registra venta]) --> B[POST /api/ventas\ntipoVenta: contado|mixto|credito]
    B --> C{Crédito?}
    C -- No --> D[Pago inicial registrado]
    C -- Sí --> E[Credito creado > saldo pendiente]
    D --> F[DetalleVenta descuenta stock]
    E --> F
    F --> G[MovimientoInventario\nauditoría+stockNuevo]
    F --> H[ClienteCreditoResumen\nactualizado]
```

### Flujo de imágenes (Cloudinary)

```mermaid
flowchart LR
    U([Usuario autenticado]) --> UP["POST /api/categorias/variantes/proveedores/upload\nmultipart/form-data"]
    UP --> CL{Credenciales Cloudinary?}
    CL -- Sí --> CN["cloudinary.uploader → https://res.cloudinary.com/..."]
    CL -- No --> LO["Fallback local → /uploads/... (solo desarrollo)"]
    CN --> IMG["Frontend usa helper imageUrl.js\ndetecta Cloudinary / uploads / legacy"]
    LO --> IMG
```

---

## 📁 Estructura del proyecto

```
WEB_ADI_ESTILOS/
│
├── 📄 package.json                # Scripts raíz (dev, build, db:*)
├── 📄 vercel.json                 # Config de deploy Vercel (raíz → Frontend/dist)
├── 📄 docker-compose.yml          # Orquestación local (opcional)
├── 📄 .github/workflows/ci.yml    # CI: Prisma validate + build frontend + imports
│
├── 📁 Backend/                    # API REST (Express + Prisma + PostgreSQL)
│   ├── 📄 railway.json            # Deploy Railway (Nixpacks + migraciones + /health)
│   ├── 📄 .env.example            # Plantilla de variables del backend
│   ├── 📁 prisma/
│   │   ├── schema.prisma          # 30 modelos · 16 enums
│   │   ├── migrations/            # Migraciones SQL versionadas
│   │   └── seeds/                 # Seeds idempotentes (roles, usr demo, catálogo...)
│   └── 📁 src/
│       ├── 📄 server.js           # Punto de entrada (inicia el servidor)
│       ├── 📄 app.js              # App Express: CORS, JSON, /uploads, /health, rutas
│       ├── 📄 allRoutes.js        # Registro de los 25+ módulos bajo /api
│       ├── 📁 config/             # serverConfig (CORS, JWT, uploads, Cloudinary)
│       ├── 📁 middleware/         # authMiddleware (JWT), uploads, validación, errores
│       ├── 📁 modules/            # auth, usuarios, productos, variantes, ventas,
│       │                          #  compras, inventario, creditos, pagos, ...
│       └── 📁 services/           # cloudinaryService, etc.
│
├── 📁 Frontend/                   # SPA React (Vite + Tailwind + Ant Design)
│   ├── 📄 vite.config.js          # manualChunks (react/antd/charts/animacion)
│   ├── 📄 .eslintrc.cjs           # Lint ES8+ React hooks
│   ├── 📄 .env.example            # VITE_API_URL / VITE_FILES_URL
│   ├── index.html
│   └── 📁 src/
│       ├── 📄 main.jsx            # Bootstrap de la app
│       ├── 📁 api/                # Clientes Axios por módulo (30+)
│       ├── 📁 components/         # layout, admin, cliente, public, common, producto
│       ├── 📁 context/            # AuthContext · CarritoContext · ThemeContext
│       ├── 📁 pages/              # public / · cliente / · admin /
│       ├── 📁 routes/             # AppRoutes · AdminRoutes · ClienteRoutes · PublicRoutes
│       └── 📁 utils/              # imageUrl (helper central) · permisos · formato
│
├── 📁 docs/                       # Guías: Deply Railway, Vercel, Cloudinary
├── 📁 database/                   # Dump SQL legacy (solo referencia; no se usa en Postgres)
└── 📁 scripts/
    ├── build-frontend.js          # Build raíz autosuficiente (instala deps si faltan)
    └── check-imports-case.js      # Guard: imports case-sensitive (rompía en Linux)
```

---

## 🚀 Instalación y configuración

### Prerrequisitos

```bash
Node.js      >= 18.x
npm          >= 9.x
Git          >= 2.x
PostgreSQL   >= 15 (servicio local o Docker)
```

> **Opcional**: cuenta en [Railway](https://railway.app) (producción) y en [Cloudinary](https://cloudinary.com) (imágenes).

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alejostone1/Adiestilos_Full.git
cd Adiestilos_Full
```

### 2. Instalar dependencias

```bash
npm run install:all
# equivalente a:
#   npm install                 (raíz → concurrently)
#   npm --prefix Backend install
#   npm --prefix Frontend install
```

> En GitHub Actions / Railway se usa `npm ci` para reproducibilidad.

### 3. Configurar variables de entorno

```bash
# Backend
cp Backend/.env.example Backend/.env
#   Editar DATABASE_URL, JWT_SECRET y (opcional) Cloudinary

# Frontend (opcional en desarrollo)
cp Frontend/.env.example Frontend/.env
```

### 4. Preparar la base de datos

```bash
# Aplicar migraciones + poblar datos demo (seeds idempotentes)
npm run db:migrate
npm run db:seed
```

### 5. Iniciar en desarrollo

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **API raíz:** http://localhost:3000/api
- **Health:** http://localhost:3000/health

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Backend + frontend juntos (concurrently) |
| `npm run dev:backend` | Solo backend (nodemon) |
| `npm run dev:frontend` | Solo frontend (Vite) |
| `npm run build` | Build de producción del frontend (autoinstala deps si faltan) |
| `npm run build:frontend` | `npm --prefix Frontend run build` |
| `npm run check:imports` | Verificador case-sensitive de imports (guarda para Linux/Vercel) |
| `npm run lint` | ESLint del frontend |
| `npm run start` | Arranca el backend en producción |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (producción) |
| `npm run db:seed` | Seeds idempotentes |
| `npm run db:reset` | Reset de BD + migraciones + seed |

### Solución de problemas comunes

```bash
# "JWT_SECRET debe tener al menos 32 caracteres"
# → Configura JWT_SECRET en Backend/.env (mín. 32 caracteres)

# "PrismaClientInitializationError"
# → Verifica que PostgreSQL esté corriendo y DATABASE_URL sea correcta

# "Could not resolve Api/... en Linux pero no en Windows"
# → Corre `npm run check:imports` — hay imports con mayúsculas mal escritas
#   (Windows es case-insensitive; Linux/Vercel no)

# "vite: command not found" en Vercel
# → Ya resuelto: vercel.json + scripts/build-frontend.js (build a prueba de todo)
```

---

## 🔐 Variables de entorno

### Backend (`Backend/.env`)

```env
NODE_ENV=development
PORT=3000

# PostgreSQL
DATABASE_URL="postgresql://postgres:CLAVE@localhost:5432/adiweb"

# JWT (mínimo 32 caracteres)
JWT_SECRET=coloca_un_secreto_largo_y_aleatorio
JWT_EXPIRES_IN=24h

# CORS (origen del frontend; '*' o lista separada por comas)
CORS_ORIGIN=http://localhost:5173

# Uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10mb

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Cloudinary (opcional en dev; REQUERIDO en producción)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=adi-estilos
```

### Frontend (`Frontend/.env.production`)

```env
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
VITE_FILES_URL=https://TU-BACKEND.up.railway.app
```

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✅ | Cadena de conexión PostgreSQL (local o Railway) |
| `JWT_SECRET` | ✅ | Secreto JWT (min. 32 caracteres) |
| `CORS_ORIGIN` | ✅ | Origen permitido del frontend |
| `CLOUDINARY_*` | ⚠️ | Sin ellas, las imágenes caen a `/uploads` (efímero en prod) |
| `VITE_API_URL` | ✅ | Base URL de la API (con `/api`) |
| `VITE_FILES_URL` | ✅ | Base URL para servir archivos/imágenes |

> ⚠️ **Nunca se suben `.env` a Git.** Solo se versionan los `.env.example`.

---

## 🗄️ Base de datos

| | |
|-|-|
| **ORM** | Prisma 5.22 (`prisma-client-js`, engine `binary`) |
| **Base de datos** | PostgreSQL 15+ |
| **Modelos** | **30 modelos** y **16 enums** |
| **Migraciones** | Versionadas en `Backend/prisma/migrations/` |
| **Seeds** | Idempotentes (`prisma/seeds/`): roles, usuarios demo, catálogo, colores, tallas, métodos de pago, tipos de movimiento |

### Arquitectura de precios e inventario (clave del sistema)

- **El precio real y el stock viven en `VarianteProducto`**, no en el producto:
  cada combinación **color × talla** tiene su propio `precioVenta`, `precioCosto`, `cantidadStock`, `stockMinimo` y `stockMaximo`.
- `Producto.precioVentaSugerido` es solo referencia; `codigoSku` es único por variante.
- Cada operación (compra, venta, ajuste) genera un `MovimientoInventario` de **auditoría** (stock anterior → nuevo, documento origen, usuario).

### Diagrama Entidad-Relación (resumen)

```mermaid
erDiagram
    Rol ||--o{ Usuario : "tiene"
    Usuario ||--o{ Venta : "cliente"
    Usuario ||--o{ Venta : "vendedor"
    Usuario ||--o{ Credito : "clientes"
    Usuario ||--o{ Pago : "registra"
    Usuario ||--o{ MovimientoInventario : "registra"

    Categoria ||--o{ Producto : "agrupa"
    Categoria ||--o{ Categoria : "padre/hijo"
    Proveedor ||--o{ Producto : "suministra"
    Proveedor ||--o{ Compra : "recibe"

    Producto ||--o{ VarianteProducto : "tiene"
    Producto ||--o{ ImagenProducto : "galeria"
    Color }o--o{ VarianteProducto : "combina"
    Talla }o--o{ VarianteProducto : "combina"
    VarianteProducto ||--o{ DetalleVenta : "se vende"
    VarianteProducto ||--o{ DetalleCompra : "se compra"
    VarianteProducto ||--o{ MovimientoInventario : "stock"

    Venta ||--|{ DetalleVenta : "detalle"
    Venta ||--o{ Pago : "paga"
    Venta |o--o{ Credito : "financia"
    Venta |o--o{ Devolucion : "devuelve"
    Compra ||--|{ DetalleCompra : "detalle"
    Compra ||--o{ MovimientoInventario : "genera"
    AjusteInventario ||--o{ DetalleAjusteInventario : "lineas"
    AjusteInventario ||--o{ MovimientoInventario : "genera"

    Descuento }o--o{ Venta : "aplica"
    Descuento ||--o{ DescuentosCliente : "asignado a"
    Descuento ||--o{ HistorialDescuento : "audita"
    MetodoPago ||--o{ Pago : "utilizado"
    Pago ||--o{ PagoDetalle : "mixto"
    EstadoPedido ||--o{ Venta : "estado"
    EstadoPedido ||--o{ Compra : "estado"
```

### Enumeraciones del sistema (16)

```prisma
EstadoUsuario      { activo, inactivo, bloqueado }
EstadoCatalogo     { activo, inactivo }
EstadoProducto     { activo, inactivo, descontinuado }
TipoTalla          { numerica, alfabetica, otra, bebe, nino, mujer, hombre, adulto, calzado, especial }
TipoDescuento      { porcentaje, valor_fijo }
AplicaDescuento    { total_venta, categoria, producto, cliente }
EstadoDescuento    { activo, inactivo, vencido }
EstadoCompra       { pendiente, recibida, parcial, cancelada }
TipoMovimientoEnum { entrada, salida, ajuste }
EstadoAjuste       { borrador, aplicado, cancelado }
TipoVenta          { contado, mixto, credito }
EstadoPago         { pendiente, parcial, pagado }
TipoPago           { inicial, abono, liquidacion }
EstadoCredito      { activo, pagado, vencido, cancelado }
TipoDevolucion     { total, parcial }
EstadoDevolucion   { pendiente, aprobada, rechazada, procesada }
```

---

## 🔑 Autenticación y roles

### Sistema de autenticación

| Componente | Implementación |
|------------|----------------|
| **Hash de contraseñas** | `bcryptjs` con salt automático |
| **Tokens** | **JWT** (`tokenAcceso`) con expiración configurabnte (`JWT_EXPIRES_IN`, 24h por defecto) |
| **Estado global frontend** | `AuthContext` + `localStorage` |
| **Protección de rutas** | Interceptor Axios + rutas protegidas en React Router (`ProtectedRoute`) |
| **Extras de seguridad** | `express-validator` en payloads, rate limiting (`RATE_LIMIT_*`), CORS por origen, salida sin exponer contraseñas |

### Roles del sistema

| Rol | Descripción | Acceso |
|---|---|---|
| **Administrador** | Control total: usuarios, roles, permisos, reportes, catálogo | `/admin/*` |
| **Vendedor** | Registra ventas, abonos, devoluciones; consulta catálogo y créditos | `/admin/ventas`, `/admin/creditos`, … |
| **Bodeguero** | Gestiona inventario, ajustes, movimientos y compras | `/admin/inventario`, `/admin/compras` |
| **Cliente** | Tienda en línea, carrito, pedidos y perfil | `/cliente/*` |

Los roles viven en la tabla `roles` con un campo `permisos` (JSON) para permisos granulares, aplicados vía middleware según la ruta.

### 👤 Usuarios demo (creados por el seed)

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123*` |
| Vendedor | `vendedor` | `Vendedor123*` |
| Cliente | `cliente` | `Cliente123*` |

> ⚠️ Cambia estas contraseñas (y el `JWT_SECRET`) antes de ir a producción.

---

## 📦 Módulos del sistema

### 🏠 Público (`/`)

| Ruta | Funcionalidad |
|------|---------------|
| `/` | Home con productos destacados |
| `/tienda` | Catálogo con búsqueda, filtros por categoría y orden |
| `/categoria/:id` | Productos de una categoría (soporta categorías jerárquicas) |
| `/producto/:id` | Detalle con galería, selector color/talla, stock y precio |
| `/checkout-whatsapp` | Pedido del carrito **enviado por WhatsApp** |
| `/login` · `/registro` | Autenticación y registro de clientes |
| `/contacto` · `/nosotros` | Páginas institucionales |

### 🛒 Cliente (`/cliente/*`)

| Rutas | Funcionalidad |
|-------|---------------|
| `/cliente/dashboard` | Panel del cliente (resumen, tienda) |
| `/cliente/tienda` · `/cliente/producto/:id` | Compra en línea |
| `/cliente/carrito` | Carrito persistente con cantidades y totales |
| `/cliente/pedidos` | Historial de pedidos |
| `/cliente/compras` | Compras del cliente |
| `/cliente/perfil` | Editar datos personales y credenciales |

### 🛠️ Administración (`/admin/*`)

| Área | Funcionalidad |
|------|---------------|
| `/admin/dashboard` | KPIs, gráficos (Recharts) y estado del negocio |
| **Catálogo** | `productos` (wizard con variantes), `variantes` (color/talla, SKU, stock, precios), `categorias`, `colores`, `tallas`, `proveedores`, `gallery` (galería por producto/variante/categoría/proveedor) |
| **Ventas** | `ventas` (registro, detalle, estados de pedido), `ventas-credito`, `metodos-pago`, `estados-pedido` |
| **Créditos** | `gestion`, `detalle`, `historial`, `pagos`, `abonos` |
| **Devoluciones** | Registro, detalle, flujo de aprobación/rechazo |
| **Inventario** | `inventario`, `movimientos`, `tipos-movimiento`, `ajustes-inventario` |
| **Compras** | `compras` con detalle y recepción |
| **Descuentos** | `descuentos` y `historial` |
| **Usuarios** | `usuarios`, roles, ventas/créditos por usuario |
| **Reportes** | Ventas, compras, inventario, créditos y pagos |

---

## 🌐 API Reference

Todos los endpoints se montan bajo el prefijo `/api` (configurable con `API_PREFIX`).
Autenticación: encabezado `Authorization: Bearer <tokenAcceso>`. Los errores siguen el formato `{ error|mensaje }`.

| Módulo | Endpoints principales | Auth |
|--------|-----------------------|------|
| **Auth** | `POST /api/auth/registro` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/perfil` · `PUT /api/auth/cambiar-contrasena` | último 2 🔒 |
| **Público** | `GET /api/public/categorias` · `/productos` · `/productos/destacados` · `/productos/:id` · `/productos/:id/variantes` · `/buscar` | ❌ |
| **Productos** | `GET/POST /api/productos` · `GET/PUT/DELETE /api/productos/:id` · `POST /api/productos/upload` | 🔒 |
| **Variantes** | `GET/POST /api/variantes` · `GET/PUT/DELETE /api/variantes/:id` · `POST /api/variantes/upload` | 🔒 |
| **Catálogos** | `categorias` · `colores` · `tallas` · `proveedores` (CRUD + `POST /upload`) · `roles` · `estados-pedido` · `metodos-pago` · `tipos-movimiento` | 🔒 |
| **Ventas** | `GET/POST /api/ventas` · `GET/PUT/DELETE /api/ventas/:id` · `ventas-credito` · `pagos` | 🔒 |
| **Inventario** | `GET/POST /api/inventario` · `movimientos` · `ajustes-inventario` · `detalle-*` | 🔒 |
| **Compras** | `GET/POST /api/compras` · `GET/PUT/DELETE /api/compras/:id` · `detalle-compras` | 🔒 |
| **Créditos** | `GET/POST /api/creditos` · `/api/creditos/:id/pagos` (abonos) · `clientes-credito-resumen` | 🔒 |
| **Devoluciones** | `GET/POST /api/devoluciones` · `/api/devoluciones/:id` (aprobación/rechazo) · `detalle-devoluciones` | 🔒 |
| **Descuentos** | `GET/POST /api/descuentos` · `GET/PUT/DELETE /api/descuentos/:id` · historial | 🔒 |
| **Imágenes/Galería** | `GET/POST /api/imagenes` (producto/variante) · `GET/POST /api/galeria` · `POST /api/galeria/upload` | 🔒 |
| **Reportes** | `GET /api/reportes/...` (ventas, compras, inventario, créditos, pagos) | 🔒 |

**Estado / salud** (sin auth): `GET /` · `GET /api/status` · `GET /health` (`{ estado: 'ok' }`).

---

## 📖 Manual de usuario

### Para clientes

#### 1. Registro e inicio de sesión
1. Ve a **/registro** y completa tus datos.
2. Inicia sesión en **/login** con tu usuario o correo.
3. Redirige a tu panel como cliente (`/cliente/dashboard`).

#### 2. Explorar la tienda
```
/tienda           → busca y filtra por categoría
/categoria/:id    → navega por categorías (con subcategorías)
/producto/:id     → elige color y talla, revisa stock y precio
```

#### 3. Hacer un pedido
1. Agrega productos a tu **carrito** desde el detalle.
2. Revisa el carrito en `/cliente/carrito` (cantidades y totales).
3. En **/checkout-whatsapp** confirma el pedido y se abre **WhatsApp** con el detalle pre-llenado para concretar la compra.

#### 4. Gestionar tu cuenta
- `/cliente/pedidos` → historial de tus pedidos.
- `/cliente/perfil` → actualiza tus datos y contraseña.

### Para vendedores

1. Inicia sesión con la cuenta `vendedor`.
2. **Ventas** (`/admin/ventas`): registra ventas de contado, mixto o a crédito, seleccionando cliente, variantes y método de pago; se descuenta stock automáticamente.
3. **Abonos** (`/admin/creditos/*`): recibe abonos sobre créditos vigentes y consulta saldos.
4. **Devoluciones** (`/admin/devoluciones`): procesa devoluciones totales/parciales.

### Para bodegueros

1. Inicia sesión con la cuenta correspondiente (rol Bodeguero).
2. **Compras** (`/admin/compras`): registra compras a proveedores y su recepción.
3. **Inventario** (`/admin/inventario`): consulta stock por variante y mínimos.
4. **Ajustes** (`/admin/ajustes-inventario`): corrige stock (mermas/robos/correcciones) con motivo; queda auditado en movimientos.
5. **Tipos de movimiento** (`/admin/tipos-movimiento`): gestiona los motivos de entrada/salida/ajuste.

### Para administradores

1. Inicia sesión con `admin`.
2. **Catálogo**: crea categorías, productos y variantes (colores, tallas, SKU, precios y stock), proveedores y sube imágenes (Cloudinary).
3. **Usuarios y roles** (`/admin/usuarios`): crea vendedores/bodegueros y gestiona permisos.
4. **Ventas y créditos**: supervisa ventas, pagos y créditos de todos los clientes.
5. **Reportes** (`/admin/reportes`): consulta reportes de ventas, compras, inventario, créditos y pagos.
6. **Descuentos**: crea promociones (porcentaje/valor fijo, con o sin código).

---

## 🎨 Sistema de diseño y UX

- **Ant Design 6** como base de componentes (tablas, formularios, modales, notificaciones) + **Tailwind 3** para utilidades puntuales.
- **Modo claro/oscuro** vía `ThemeContext` (tema controlado).
- **Animaciones suaves** con **Framer Motion** (presencia, transiciones).
- **Carruseles** con **Embla Carousel** (home y galerías).
- **Confirmaciones elegantes** con **SweetAlert2**.
- **Responsive**: los paneles admin y la tienda se adaptan a escritorio, tablet y móvil.

---

## ⚡ Performance y optimizaciones

- **Code splitting por chunks** (`vite.config.js` → `manualChunks`): `react`, `antd`, `charts` y `animacion` en bundles separados (HTML más liviano y caché por librería).
- **Helper central de imágenes** (`Frontend/src/utils/imageUrl.js`): una sola fuente de verdad para URLs (Cloudinary / uploads / legacy), sin duplicar lógica.
- **CDN de Cloudinary** para imágenes en producción (entrega remota y optimizada).
- **Build autosuficiente** (`scripts/build-frontend.js`): en CI/Vercel instala deps del frontend si faltan — a prueba de entornos limpios.
- **Verificador case-sensitive de imports** (`npm run check:imports`): evita regresiones que rompen build en Linux (Windows es case-insensitive y no las detecta).
- **Seeds idempotentes**: ejecutar `db:seed` varias veces no crea duplicados.
- **Índices de BD** en campos de búsqueda/filtro (estado, categoría, fechas, documentos).

---

## 🚢 Despliegue

### Arquitectura de producción

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN                            │
│   ┌───────────────┐    ┌────────────────┐               │
│   │   Vercel      │    │   Railway      │               │
│   │  Frontend SPA │◄──►│  Backend API   │◄──► PostgreSQL│
│   │ (Frontend/dist)│   │  + migraciones │               │
│   └───────┬───────┘    └───────┬────────┘               │
│           │  HTTPS (CORS)      │                        │
│           ▼                    ▼                        │
│     Cloudinary CDN   (imágenes vía los endpoints)       │
└─────────────────────────────────────────────────────────┘
```

### Frontend → Vercel (✅ desplegado)

- URL de producción: **https://adiestilos-full.vercel.app**
- `vercel.json` en la raíz define `installCommand`, `buildCommand` y `outputDirectory` automáticamente → funciona **sin configurar Root Directory**.
- Variables en el panel/CLI: `VITE_API_URL` y `VITE_FILES_URL` (ya apuntan al dominio del backend).
- Guía completa: [`docs/DEPLOY-VERCEL.md`](docs/DEPLOY-VERCEL.md)

### Backend + BD → Railway (🔄 preparado)

- Proyecto `desirable-perfection` · servicio `api` · PostgreSQL gestionado · dominio `https://api-production-cdcd.up.railway.app`.
- `Backend/railway.json`: builder Nixpacks, **start command** `npx prisma migrate deploy && node src/server.js`, **healthcheck** `GET /health`, restart ON_FAILURE.
- Variables ya cargadas en el servicio: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`, `CLOUDINARY_*`.
- Deploy con un comando:
  ```bash
  railway up   # desde Backend/
  ```
- Guía completa: [`docs/DEPLOY-RAILWAY.md`](docs/DEPLOY-RAILWAY.md)

### Imágenes → Cloudinary (✅ activo y validado)

- Credenciales cargadas (local + Railway) y **validadas** (ping + subida y borrado de prueba).
- Sin credenciales el sistema **no se rompe**: cae a `/uploads` local (solo desarrollo).
- Guía completa: [`docs/CLOUDINARY.md`](docs/CLOUDINARY.md)

### CI/CD (GitHub Actions)

`.github/workflows/ci.yml` ejecuta en cada push a `main`:

| Job | Pasos |
|-----|-------|
| **Backend** | `prisma validate` → `prisma format --check` → `prisma generate` |
| **Frontend** | `npm ci` → `node ../scripts/check-imports-case.js` → `npm run build` |

---

## 🧪 Verificación y QA

- ✅ `npx prisma validate` y `npx prisma format --check` pasan sin errores.
- ✅ Seeds **idempotentes** (ejecutar varias veces no duplica datos).
- ✅ Smoke tests reales: `GET /api/status` 200, `POST /api/auth/login` → JWT, `GET /api/public/productos`, `POST /api/categorias/upload` (multipart), `GET /health` 200.
- ✅ Build de producción del frontend compila con chunks optimizados.
- ✅ Import checker (`npm run check:imports`) en CI.
- ✅ Cloudinary validado (subida + borrado reales en la nube).

---

## 🗺️ Roadmap

```
✅ COMPLETADO (v1)
├── Catálogo jerárquico: categorías → productos → variantes (color/talla/SKU)
├── Inventario con movimientos, ajustes y tipos configurables
├── Ventas (contado/mixto/crédito) + pagos (inicial/abono/liquidación)
├── Créditos a clientes con resumen y días de mora
├── Devoluciones y descuentos con historial auditado
├── Roles y permisos (admin, vendedor, bodeguero, cliente)
├── Tienda en línea + carrito + checkout WhatsApp
├── Galería de imágenes con Cloudinary
├── Dashboard y reportes
├── Despliegue: Vercel ✅ + Railway preparado + CI

🔄 EN DESARROLLO
├── Despliegue en caliente del backend (ventana hora-pico de Railway gratis)
├── Documentación interactiva de la API (/api-docs)
└── Repos de reportes exportables (PDF/Excel)

🔜 PRÓXIMAS VERSIONES
├── 📦 Módulo de bodega/almacén por sucursal
├── 💳 Pasarela de pagos en línea (PSE / tarjetas)
├── 🚚 Envíos y domicilios integrados
├── 📈 Analytics avanzados y exportación de datos
├── 🔔 Notificaciones (correo/WhatsApp)
└── 📱 App móvil (React Native) compartiendo la API
```

---

## 👥 Créditos y equipo

<div align="center">

### Desarrollado con ❤️ por

| | |
|---|---|
| **Alejandro Piedrahita** | Arquitectura · Backend · Despliegue · Documentación |

</div>

### Contexto del proyecto

```
Proyecto:    ADI ESTILOS — Sistema de gestión comercial y tienda en línea
Negocio:     Tienda de ropa
Year:        2026
```

### Sobre el proyecto

ADI ESTILOS nace de la necesidad de unificar en **una sola plataforma** la operación diaria de una tienda de ropa: catálogo con variantes de color y talla, control de inventario con auditoría, ventas con crédito y pagos parciales, compras a proveedores, devoluciones y descuentos — más una **vitrina en línea** donde el cliente compra desde casa y cierra el pedido por WhatsApp. El sistema fue diseñado con enfoque de **producción real**: monorepo desacoplado, API REST versionada, migraciones versionadas, seeds reproducibles, CI y despliegue automatizado.

---

<div align="center">

---

**ADI ESTILOS** · 2026

Hecho con React · Vite · Ant Design · Express · Prisma · PostgreSQL · Cloudinary

[![GitHub](https://img.shields.io/badge/GitHub-Ver_código-181717?style=flat-square&logo=github)](https://github.com/Alejostone1/Adiestilos_Full)
[![Vercel](https://img.shields.io/badge/Demo-Vercel-000000?style=flat-square&logo=vercel)](https://adiestilos-full.vercel.app)

*"Gestiona, vende, controla — un solo sistema para tu tienda"*

</div>