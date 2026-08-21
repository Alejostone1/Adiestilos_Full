# Usar Node.js 18 Alpine como imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (incluye prisma para migrate/generate en runtime)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Crear directorio para uploads
RUN mkdir -p uploads/categorias uploads/productos uploads/proveedores uploads/variantes

# Exponer puerto
EXPOSE 3000

# Ejecutar migraciones y arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
