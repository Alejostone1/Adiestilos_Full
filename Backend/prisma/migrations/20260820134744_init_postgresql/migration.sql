-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo', 'bloqueado');

-- CreateEnum
CREATE TYPE "EstadoCatalogo" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "EstadoProducto" AS ENUM ('activo', 'inactivo', 'descontinuado');

-- CreateEnum
CREATE TYPE "TipoTalla" AS ENUM ('numerica', 'alfabetica', 'otra', 'bebe', 'nino', 'mujer', 'hombre', 'adulto', 'calzado', 'especial');

-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('porcentaje', 'valor_fijo');

-- CreateEnum
CREATE TYPE "AplicaDescuento" AS ENUM ('total_venta', 'categoria', 'producto', 'cliente');

-- CreateEnum
CREATE TYPE "EstadoDescuento" AS ENUM ('activo', 'inactivo', 'vencido');

-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('pendiente', 'recibida', 'parcial', 'cancelada');

-- CreateEnum
CREATE TYPE "TipoMovimientoEnum" AS ENUM ('entrada', 'salida', 'ajuste');

-- CreateEnum
CREATE TYPE "EstadoAjuste" AS ENUM ('borrador', 'aplicado', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoVenta" AS ENUM ('contado', 'mixto', 'credito');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'parcial', 'pagado');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('inicial', 'abono', 'liquidacion');

-- CreateEnum
CREATE TYPE "EstadoCredito" AS ENUM ('activo', 'pagado', 'vencido', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoDevolucion" AS ENUM ('total', 'parcial');

-- CreateEnum
CREATE TYPE "EstadoDevolucion" AS ENUM ('pendiente', 'aprobada', 'rechazada', 'procesada');

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "permisos" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "usuario" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "direccion" TEXT,
    "id_rol" INTEGER NOT NULL DEFAULT 2,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'activo',
    "ultima_conexion" TIMESTAMP(0),
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "imagen_categoria" VARCHAR(255),
    "categoria_padre" INTEGER,
    "estado" "EstadoCatalogo" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre_proveedor" VARCHAR(100) NOT NULL,
    "nit_cc" VARCHAR(20) NOT NULL,
    "contacto" VARCHAR(100),
    "telefono" VARCHAR(20),
    "correo_electronico" VARCHAR(100),
    "direccion" TEXT,
    "imagen_proveedor" VARCHAR(255),
    "notas" TEXT,
    "estado" "EstadoCatalogo" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "colores" (
    "id_color" SERIAL NOT NULL,
    "nombre_color" VARCHAR(50) NOT NULL,
    "codigo_hex" VARCHAR(7),
    "estado" "EstadoCatalogo" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colores_pkey" PRIMARY KEY ("id_color")
);

-- CreateTable
CREATE TABLE "tallas" (
    "id_talla" SERIAL NOT NULL,
    "nombre_talla" VARCHAR(80) NOT NULL,
    "tipo_talla" "TipoTalla" NOT NULL DEFAULT 'alfabetica',
    "estado" "EstadoCatalogo" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tallas_pkey" PRIMARY KEY ("id_talla")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "codigo_referencia" VARCHAR(100) NOT NULL,
    "nombre_producto" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "precio_venta_sugerido" INTEGER NOT NULL,
    "unidad_medida" VARCHAR(20) NOT NULL DEFAULT 'unidad',
    "tiene_colores" BOOLEAN NOT NULL DEFAULT false,
    "tiene_tallas" BOOLEAN NOT NULL DEFAULT false,
    "datos_tecnicos" JSONB,
    "id_categoria" INTEGER NOT NULL,
    "id_proveedor" INTEGER,
    "estado" "EstadoProducto" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "imagenes_productos" (
    "id_imagen" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "ruta_imagen" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(255),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_productos_pkey" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "variantes_producto" (
    "id_variante" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_color" INTEGER,
    "id_talla" INTEGER,
    "codigo_sku" VARCHAR(100) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "precio_costo" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "cantidad_stock" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "stock_minimo" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "stock_maximo" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "estado" "EstadoCatalogo" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variantes_producto_pkey" PRIMARY KEY ("id_variante")
);

-- CreateTable
CREATE TABLE "imagenes_variantes" (
    "id_imagen_variante" SERIAL NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "ruta_imagen" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(255),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_variantes_pkey" PRIMARY KEY ("id_imagen_variante")
);

-- CreateTable
CREATE TABLE "descuentos" (
    "id_descuento" SERIAL NOT NULL,
    "nombre_descuento" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "codigo_descuento" VARCHAR(50),
    "tipo_descuento" "TipoDescuento" NOT NULL,
    "valor_descuento" DECIMAL(10,2) NOT NULL,
    "aplica_a" "AplicaDescuento" NOT NULL DEFAULT 'total_venta',
    "id_categoria" INTEGER,
    "id_producto" INTEGER,
    "monto_minimo_compra" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "fecha_inicio" DATE,
    "fecha_fin" DATE,
    "requiere_codigo" BOOLEAN NOT NULL DEFAULT false,
    "cantidad_maxima_usos" INTEGER,
    "usos_actuales" INTEGER NOT NULL DEFAULT 0,
    "uso_por_cliente" INTEGER NOT NULL DEFAULT 1,
    "usuario_creacion" INTEGER NOT NULL,
    "estado" "EstadoDescuento" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descuentos_pkey" PRIMARY KEY ("id_descuento")
);

-- CreateTable
CREATE TABLE "descuentos_clientes" (
    "id_descuento_cliente" SERIAL NOT NULL,
    "id_descuento" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "usos_realizados" INTEGER NOT NULL DEFAULT 0,
    "fecha_asignacion" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descuentos_clientes_pkey" PRIMARY KEY ("id_descuento_cliente")
);

-- CreateTable
CREATE TABLE "historial_descuentos" (
    "id_historial_descuento" SERIAL NOT NULL,
    "id_descuento" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "valor_aplicado" DECIMAL(10,2) NOT NULL,
    "fecha_uso" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_descuentos_pkey" PRIMARY KEY ("id_historial_descuento")
);

-- CreateTable
CREATE TABLE "compras" (
    "id_compra" SERIAL NOT NULL,
    "numero_compra" VARCHAR(50) NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_usuario_registro" INTEGER NOT NULL,
    "id_estado_pedido" INTEGER NOT NULL DEFAULT 8,
    "fecha_compra" DATE NOT NULL,
    "fecha_entrega" DATE,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "impuestos" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(12,2) NOT NULL,
    "notas" TEXT,
    "estado" "EstadoCompra" NOT NULL DEFAULT 'pendiente',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id_compra")
);

-- CreateTable
CREATE TABLE "detalle_compras" (
    "id_detalle_compra" SERIAL NOT NULL,
    "id_compra" INTEGER NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "cantidad_recibida" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "descuento_linea" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "total_linea" DECIMAL(12,2) NOT NULL,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_compras_pkey" PRIMARY KEY ("id_detalle_compra")
);

-- CreateTable
CREATE TABLE "tipos_movimiento" (
    "id_tipo_movimiento" SERIAL NOT NULL,
    "nombre_tipo" VARCHAR(50) NOT NULL,
    "tipo" "TipoMovimientoEnum" NOT NULL,
    "descripcion" TEXT,
    "afecta_costo" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_movimiento_pkey" PRIMARY KEY ("id_tipo_movimiento")
);

-- CreateTable
CREATE TABLE "ajustes_inventario" (
    "id_ajuste" SERIAL NOT NULL,
    "numero_ajuste" VARCHAR(50) NOT NULL,
    "id_tipo_movimiento" INTEGER NOT NULL,
    "usuario_registro" INTEGER NOT NULL,
    "fecha_ajuste" DATE NOT NULL,
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "estado" "EstadoAjuste" NOT NULL DEFAULT 'borrador',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ajustes_inventario_pkey" PRIMARY KEY ("id_ajuste")
);

-- CreateTable
CREATE TABLE "detalle_ajustes_inventario" (
    "id_detalle_ajuste" SERIAL NOT NULL,
    "id_ajuste" INTEGER NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "cantidad_ajuste" DECIMAL(10,2) NOT NULL,
    "stock_anterior" DECIMAL(10,2) NOT NULL,
    "stock_nuevo" DECIMAL(10,2) NOT NULL,
    "costo_unitario" DECIMAL(10,2),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_ajustes_inventario_pkey" PRIMARY KEY ("id_detalle_ajuste")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id_movimiento" SERIAL NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "id_tipo_movimiento" INTEGER NOT NULL,
    "usuario_registro" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "stock_anterior" DECIMAL(10,2) NOT NULL,
    "stock_nuevo" DECIMAL(10,2) NOT NULL,
    "costo_unitario" DECIMAL(10,2),
    "valor_total" DECIMAL(12,2),
    "motivo" TEXT,
    "fecha_movimiento" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_compra" INTEGER,
    "id_venta" INTEGER,
    "id_ajuste" INTEGER,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "tipos_metodo_pago" (
    "id_tipo_metodo" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_metodo_pago_pkey" PRIMARY KEY ("id_tipo_metodo")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id_metodo_pago" SERIAL NOT NULL,
    "nombre_metodo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "id_tipo_metodo" INTEGER NOT NULL,
    "requiere_referencia" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id_metodo_pago")
);

-- CreateTable
CREATE TABLE "estados_pedido" (
    "id_estado_pedido" SERIAL NOT NULL,
    "nombre_estado" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "color" VARCHAR(20),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estados_pedido_pkey" PRIMARY KEY ("id_estado_pedido")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id_venta" SERIAL NOT NULL,
    "numero_factura" VARCHAR(50) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_usuario_vendedor" INTEGER,
    "id_estado_pedido" INTEGER NOT NULL,
    "id_descuento" INTEGER,
    "codigo_descuento_usado" VARCHAR(50),
    "direccion_entrega" TEXT,
    "tipo_venta" "TipoVenta" NOT NULL DEFAULT 'contado',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento_total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "impuestos" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(12,2) NOT NULL,
    "total_pagado" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "saldo_pendiente" DECIMAL(12,2) NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id_venta")
);

-- CreateTable
CREATE TABLE "detalle_ventas" (
    "id_detalle_venta" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "descuento_linea" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "total_linea" DECIMAL(12,2) NOT NULL,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_ventas_pkey" PRIMARY KEY ("id_detalle_venta")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_metodo_pago" INTEGER NOT NULL,
    "usuario_registro" INTEGER NOT NULL,
    "tipo_pago" "TipoPago" NOT NULL DEFAULT 'inicial',
    "monto" DECIMAL(12,2) NOT NULL,
    "saldo_anterior" DECIMAL(12,2) NOT NULL,
    "saldo_nuevo" DECIMAL(12,2) NOT NULL,
    "referencia" VARCHAR(100),
    "notas" TEXT,
    "fecha_pago" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "pagos_detalle" (
    "id_pago_detalle" SERIAL NOT NULL,
    "id_pago" INTEGER NOT NULL,
    "id_metodo_pago" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "referencia" VARCHAR(150),

    CONSTRAINT "pagos_detalle_pkey" PRIMARY KEY ("id_pago_detalle")
);

-- CreateTable
CREATE TABLE "creditos" (
    "id_credito" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "usuario_registro" INTEGER NOT NULL,
    "monto_inicial" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "monto_credito" DECIMAL(12,2) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "total_abonado" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "saldo_pendiente" DECIMAL(12,2) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_vencimiento" DATE,
    "fecha_ultimo_pago" DATE,
    "dias_mora" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "estado" "EstadoCredito" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditos_pkey" PRIMARY KEY ("id_credito")
);

-- CreateTable
CREATE TABLE "clientes_credito_resumen" (
    "id_usuario" INTEGER NOT NULL,
    "limite_credito" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "credito_total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "saldo_total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_abonado" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "cantidad_creditos_activos" INTEGER NOT NULL DEFAULT 0,
    "cantidad_creditos_pagados" INTEGER NOT NULL DEFAULT 0,
    "cantidad_creditos_vencidos" INTEGER NOT NULL DEFAULT 0,
    "fecha_ultimo_credito" DATE,
    "fecha_ultimo_pago" DATE,
    "fecha_actualizacion" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_credito_resumen_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "devoluciones" (
    "id_devolucion" SERIAL NOT NULL,
    "numero_devolucion" VARCHAR(50) NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "usuario_registro" INTEGER NOT NULL,
    "tipo_devolucion" "TipoDevolucion" NOT NULL,
    "motivo" TEXT NOT NULL,
    "subtotal_devolucion" DECIMAL(12,2) NOT NULL,
    "impuestos_devolucion" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_devolucion" DECIMAL(12,2) NOT NULL,
    "fecha_devolucion" DATE NOT NULL,
    "observaciones" TEXT,
    "estado" "EstadoDevolucion" NOT NULL DEFAULT 'pendiente',
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devoluciones_pkey" PRIMARY KEY ("id_devolucion")
);

-- CreateTable
CREATE TABLE "detalle_devoluciones" (
    "id_detalle_devolucion" SERIAL NOT NULL,
    "id_devolucion" INTEGER NOT NULL,
    "id_detalle_venta" INTEGER NOT NULL,
    "id_variante" INTEGER NOT NULL,
    "cantidad_devuelta" DECIMAL(10,2) NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "motivo_linea" TEXT,
    "creado_en" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_devoluciones_pkey" PRIMARY KEY ("id_detalle_devolucion")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE INDEX "roles_nombre_rol_idx" ON "roles"("nombre_rol");

-- CreateIndex
CREATE INDEX "roles_activo_idx" ON "roles"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuarios_usuario_idx" ON "usuarios"("usuario");

-- CreateIndex
CREATE INDEX "usuarios_correo_electronico_idx" ON "usuarios"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuarios_id_rol_idx" ON "usuarios"("id_rol");

-- CreateIndex
CREATE INDEX "usuarios_estado_idx" ON "usuarios"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_categoria_key" ON "categorias"("nombre_categoria");

-- CreateIndex
CREATE INDEX "categorias_estado_idx" ON "categorias"("estado");

-- CreateIndex
CREATE INDEX "categorias_categoria_padre_idx" ON "categorias"("categoria_padre");

-- CreateIndex
CREATE INDEX "categorias_nombre_categoria_idx" ON "categorias"("nombre_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_nit_cc_key" ON "proveedores"("nit_cc");

-- CreateIndex
CREATE INDEX "proveedores_nit_cc_idx" ON "proveedores"("nit_cc");

-- CreateIndex
CREATE INDEX "proveedores_estado_idx" ON "proveedores"("estado");

-- CreateIndex
CREATE INDEX "proveedores_nombre_proveedor_idx" ON "proveedores"("nombre_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "colores_nombre_color_key" ON "colores"("nombre_color");

-- CreateIndex
CREATE INDEX "colores_estado_idx" ON "colores"("estado");

-- CreateIndex
CREATE INDEX "colores_nombre_color_idx" ON "colores"("nombre_color");

-- CreateIndex
CREATE UNIQUE INDEX "tallas_nombre_talla_key" ON "tallas"("nombre_talla");

-- CreateIndex
CREATE INDEX "tallas_tipo_talla_idx" ON "tallas"("tipo_talla");

-- CreateIndex
CREATE INDEX "tallas_estado_idx" ON "tallas"("estado");

-- CreateIndex
CREATE INDEX "tallas_nombre_talla_idx" ON "tallas"("nombre_talla");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_referencia_key" ON "productos"("codigo_referencia");

-- CreateIndex
CREATE INDEX "productos_codigo_referencia_idx" ON "productos"("codigo_referencia");

-- CreateIndex
CREATE INDEX "productos_id_categoria_idx" ON "productos"("id_categoria");

-- CreateIndex
CREATE INDEX "productos_id_proveedor_idx" ON "productos"("id_proveedor");

-- CreateIndex
CREATE INDEX "productos_estado_idx" ON "productos"("estado");

-- CreateIndex
CREATE INDEX "productos_nombre_producto_idx" ON "productos"("nombre_producto");

-- CreateIndex
CREATE INDEX "imagenes_productos_id_producto_idx" ON "imagenes_productos"("id_producto");

-- CreateIndex
CREATE INDEX "imagenes_productos_es_principal_idx" ON "imagenes_productos"("es_principal");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_producto_codigo_sku_key" ON "variantes_producto"("codigo_sku");

-- CreateIndex
CREATE INDEX "variantes_producto_codigo_sku_idx" ON "variantes_producto"("codigo_sku");

-- CreateIndex
CREATE INDEX "variantes_producto_id_producto_idx" ON "variantes_producto"("id_producto");

-- CreateIndex
CREATE INDEX "variantes_producto_id_color_idx" ON "variantes_producto"("id_color");

-- CreateIndex
CREATE INDEX "variantes_producto_id_talla_idx" ON "variantes_producto"("id_talla");

-- CreateIndex
CREATE INDEX "variantes_producto_cantidad_stock_idx" ON "variantes_producto"("cantidad_stock");

-- CreateIndex
CREATE INDEX "variantes_producto_estado_idx" ON "variantes_producto"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_producto_id_producto_id_color_id_talla_key" ON "variantes_producto"("id_producto", "id_color", "id_talla");

-- CreateIndex
CREATE INDEX "imagenes_variantes_id_variante_idx" ON "imagenes_variantes"("id_variante");

-- CreateIndex
CREATE INDEX "imagenes_variantes_es_principal_idx" ON "imagenes_variantes"("es_principal");

-- CreateIndex
CREATE UNIQUE INDEX "descuentos_codigo_descuento_key" ON "descuentos"("codigo_descuento");

-- CreateIndex
CREATE INDEX "descuentos_codigo_descuento_idx" ON "descuentos"("codigo_descuento");

-- CreateIndex
CREATE INDEX "descuentos_tipo_descuento_idx" ON "descuentos"("tipo_descuento");

-- CreateIndex
CREATE INDEX "descuentos_estado_idx" ON "descuentos"("estado");

-- CreateIndex
CREATE INDEX "descuentos_fecha_inicio_fecha_fin_idx" ON "descuentos"("fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "descuentos_aplica_a_idx" ON "descuentos"("aplica_a");

-- CreateIndex
CREATE INDEX "descuentos_id_categoria_idx" ON "descuentos"("id_categoria");

-- CreateIndex
CREATE INDEX "descuentos_id_producto_idx" ON "descuentos"("id_producto");

-- CreateIndex
CREATE INDEX "descuentos_usuario_creacion_idx" ON "descuentos"("usuario_creacion");

-- CreateIndex
CREATE INDEX "descuentos_clientes_id_descuento_idx" ON "descuentos_clientes"("id_descuento");

-- CreateIndex
CREATE INDEX "descuentos_clientes_id_usuario_idx" ON "descuentos_clientes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "descuentos_clientes_id_descuento_id_usuario_key" ON "descuentos_clientes"("id_descuento", "id_usuario");

-- CreateIndex
CREATE INDEX "historial_descuentos_id_descuento_idx" ON "historial_descuentos"("id_descuento");

-- CreateIndex
CREATE INDEX "historial_descuentos_id_venta_idx" ON "historial_descuentos"("id_venta");

-- CreateIndex
CREATE INDEX "historial_descuentos_id_usuario_idx" ON "historial_descuentos"("id_usuario");

-- CreateIndex
CREATE INDEX "historial_descuentos_fecha_uso_idx" ON "historial_descuentos"("fecha_uso");

-- CreateIndex
CREATE UNIQUE INDEX "compras_numero_compra_key" ON "compras"("numero_compra");

-- CreateIndex
CREATE INDEX "compras_estado_idx" ON "compras"("estado");

-- CreateIndex
CREATE INDEX "compras_numero_compra_idx" ON "compras"("numero_compra");

-- CreateIndex
CREATE INDEX "compras_id_proveedor_idx" ON "compras"("id_proveedor");

-- CreateIndex
CREATE INDEX "compras_id_usuario_registro_idx" ON "compras"("id_usuario_registro");

-- CreateIndex
CREATE INDEX "compras_fecha_compra_idx" ON "compras"("fecha_compra");

-- CreateIndex
CREATE INDEX "compras_id_estado_pedido_idx" ON "compras"("id_estado_pedido");

-- CreateIndex
CREATE INDEX "detalle_compras_id_compra_idx" ON "detalle_compras"("id_compra");

-- CreateIndex
CREATE INDEX "detalle_compras_id_variante_idx" ON "detalle_compras"("id_variante");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_movimiento_nombre_tipo_key" ON "tipos_movimiento"("nombre_tipo");

-- CreateIndex
CREATE INDEX "tipos_movimiento_tipo_idx" ON "tipos_movimiento"("tipo");

-- CreateIndex
CREATE INDEX "tipos_movimiento_activo_idx" ON "tipos_movimiento"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "ajustes_inventario_numero_ajuste_key" ON "ajustes_inventario"("numero_ajuste");

-- CreateIndex
CREATE INDEX "ajustes_inventario_numero_ajuste_idx" ON "ajustes_inventario"("numero_ajuste");

-- CreateIndex
CREATE INDEX "ajustes_inventario_fecha_ajuste_idx" ON "ajustes_inventario"("fecha_ajuste");

-- CreateIndex
CREATE INDEX "ajustes_inventario_estado_idx" ON "ajustes_inventario"("estado");

-- CreateIndex
CREATE INDEX "ajustes_inventario_id_tipo_movimiento_idx" ON "ajustes_inventario"("id_tipo_movimiento");

-- CreateIndex
CREATE INDEX "ajustes_inventario_usuario_registro_idx" ON "ajustes_inventario"("usuario_registro");

-- CreateIndex
CREATE INDEX "detalle_ajustes_inventario_id_ajuste_idx" ON "detalle_ajustes_inventario"("id_ajuste");

-- CreateIndex
CREATE INDEX "detalle_ajustes_inventario_id_variante_idx" ON "detalle_ajustes_inventario"("id_variante");

-- CreateIndex
CREATE INDEX "movimientos_inventario_id_variante_idx" ON "movimientos_inventario"("id_variante");

-- CreateIndex
CREATE INDEX "movimientos_inventario_id_tipo_movimiento_idx" ON "movimientos_inventario"("id_tipo_movimiento");

-- CreateIndex
CREATE INDEX "movimientos_inventario_fecha_movimiento_idx" ON "movimientos_inventario"("fecha_movimiento");

-- CreateIndex
CREATE INDEX "movimientos_inventario_id_compra_idx" ON "movimientos_inventario"("id_compra");

-- CreateIndex
CREATE INDEX "movimientos_inventario_id_venta_idx" ON "movimientos_inventario"("id_venta");

-- CreateIndex
CREATE INDEX "movimientos_inventario_id_ajuste_idx" ON "movimientos_inventario"("id_ajuste");

-- CreateIndex
CREATE INDEX "movimientos_inventario_usuario_registro_idx" ON "movimientos_inventario"("usuario_registro");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_metodo_pago_codigo_key" ON "tipos_metodo_pago"("codigo");

-- CreateIndex
CREATE INDEX "tipos_metodo_pago_codigo_idx" ON "tipos_metodo_pago"("codigo");

-- CreateIndex
CREATE INDEX "tipos_metodo_pago_activo_idx" ON "tipos_metodo_pago"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_nombre_metodo_key" ON "metodos_pago"("nombre_metodo");

-- CreateIndex
CREATE INDEX "metodos_pago_id_tipo_metodo_idx" ON "metodos_pago"("id_tipo_metodo");

-- CreateIndex
CREATE INDEX "metodos_pago_activo_idx" ON "metodos_pago"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "estados_pedido_nombre_estado_key" ON "estados_pedido"("nombre_estado");

-- CreateIndex
CREATE INDEX "estados_pedido_activo_idx" ON "estados_pedido"("activo");

-- CreateIndex
CREATE INDEX "estados_pedido_orden_idx" ON "estados_pedido"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_numero_factura_key" ON "ventas"("numero_factura");

-- CreateIndex
CREATE INDEX "ventas_numero_factura_idx" ON "ventas"("numero_factura");

-- CreateIndex
CREATE INDEX "ventas_id_usuario_idx" ON "ventas"("id_usuario");

-- CreateIndex
CREATE INDEX "ventas_id_usuario_vendedor_idx" ON "ventas"("id_usuario_vendedor");

-- CreateIndex
CREATE INDEX "ventas_id_descuento_idx" ON "ventas"("id_descuento");

-- CreateIndex
CREATE INDEX "ventas_creado_en_idx" ON "ventas"("creado_en");

-- CreateIndex
CREATE INDEX "ventas_tipo_venta_idx" ON "ventas"("tipo_venta");

-- CreateIndex
CREATE INDEX "ventas_estado_pago_idx" ON "ventas"("estado_pago");

-- CreateIndex
CREATE INDEX "ventas_id_estado_pedido_idx" ON "ventas"("id_estado_pedido");

-- CreateIndex
CREATE INDEX "detalle_ventas_id_venta_idx" ON "detalle_ventas"("id_venta");

-- CreateIndex
CREATE INDEX "detalle_ventas_id_variante_idx" ON "detalle_ventas"("id_variante");

-- CreateIndex
CREATE INDEX "pagos_id_venta_idx" ON "pagos"("id_venta");

-- CreateIndex
CREATE INDEX "pagos_tipo_pago_idx" ON "pagos"("tipo_pago");

-- CreateIndex
CREATE INDEX "pagos_fecha_pago_idx" ON "pagos"("fecha_pago");

-- CreateIndex
CREATE INDEX "pagos_id_metodo_pago_idx" ON "pagos"("id_metodo_pago");

-- CreateIndex
CREATE INDEX "pagos_usuario_registro_idx" ON "pagos"("usuario_registro");

-- CreateIndex
CREATE INDEX "pagos_detalle_id_pago_idx" ON "pagos_detalle"("id_pago");

-- CreateIndex
CREATE INDEX "pagos_detalle_id_metodo_pago_idx" ON "pagos_detalle"("id_metodo_pago");

-- CreateIndex
CREATE UNIQUE INDEX "creditos_id_venta_key" ON "creditos"("id_venta");

-- CreateIndex
CREATE INDEX "creditos_id_venta_idx" ON "creditos"("id_venta");

-- CreateIndex
CREATE INDEX "creditos_id_usuario_idx" ON "creditos"("id_usuario");

-- CreateIndex
CREATE INDEX "creditos_estado_idx" ON "creditos"("estado");

-- CreateIndex
CREATE INDEX "creditos_fecha_vencimiento_idx" ON "creditos"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "creditos_saldo_pendiente_idx" ON "creditos"("saldo_pendiente");

-- CreateIndex
CREATE INDEX "creditos_usuario_registro_idx" ON "creditos"("usuario_registro");

-- CreateIndex
CREATE INDEX "clientes_credito_resumen_saldo_total_idx" ON "clientes_credito_resumen"("saldo_total");

-- CreateIndex
CREATE INDEX "clientes_credito_resumen_limite_credito_idx" ON "clientes_credito_resumen"("limite_credito");

-- CreateIndex
CREATE UNIQUE INDEX "devoluciones_numero_devolucion_key" ON "devoluciones"("numero_devolucion");

-- CreateIndex
CREATE INDEX "devoluciones_numero_devolucion_idx" ON "devoluciones"("numero_devolucion");

-- CreateIndex
CREATE INDEX "devoluciones_id_venta_idx" ON "devoluciones"("id_venta");

-- CreateIndex
CREATE INDEX "devoluciones_id_usuario_idx" ON "devoluciones"("id_usuario");

-- CreateIndex
CREATE INDEX "devoluciones_estado_idx" ON "devoluciones"("estado");

-- CreateIndex
CREATE INDEX "devoluciones_fecha_devolucion_idx" ON "devoluciones"("fecha_devolucion");

-- CreateIndex
CREATE INDEX "devoluciones_usuario_registro_idx" ON "devoluciones"("usuario_registro");

-- CreateIndex
CREATE INDEX "detalle_devoluciones_id_devolucion_idx" ON "detalle_devoluciones"("id_devolucion");

-- CreateIndex
CREATE INDEX "detalle_devoluciones_id_detalle_venta_idx" ON "detalle_devoluciones"("id_detalle_venta");

-- CreateIndex
CREATE INDEX "detalle_devoluciones_id_variante_idx" ON "detalle_devoluciones"("id_variante");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_categoria_padre_fkey" FOREIGN KEY ("categoria_padre") REFERENCES "categorias"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedores"("id_proveedor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_productos" ADD CONSTRAINT "imagenes_productos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_id_color_fkey" FOREIGN KEY ("id_color") REFERENCES "colores"("id_color") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_id_talla_fkey" FOREIGN KEY ("id_talla") REFERENCES "tallas"("id_talla") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_variantes" ADD CONSTRAINT "imagenes_variantes_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuentos" ADD CONSTRAINT "descuentos_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuentos" ADD CONSTRAINT "descuentos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuentos" ADD CONSTRAINT "descuentos_usuario_creacion_fkey" FOREIGN KEY ("usuario_creacion") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuentos_clientes" ADD CONSTRAINT "descuentos_clientes_id_descuento_fkey" FOREIGN KEY ("id_descuento") REFERENCES "descuentos"("id_descuento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuentos_clientes" ADD CONSTRAINT "descuentos_clientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_descuentos" ADD CONSTRAINT "historial_descuentos_id_descuento_fkey" FOREIGN KEY ("id_descuento") REFERENCES "descuentos"("id_descuento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_descuentos" ADD CONSTRAINT "historial_descuentos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_descuentos" ADD CONSTRAINT "historial_descuentos_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id_venta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedores"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_id_usuario_registro_fkey" FOREIGN KEY ("id_usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_id_estado_pedido_fkey" FOREIGN KEY ("id_estado_pedido") REFERENCES "estados_pedido"("id_estado_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_compras" ADD CONSTRAINT "detalle_compras_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "compras"("id_compra") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_compras" ADD CONSTRAINT "detalle_compras_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajustes_inventario" ADD CONSTRAINT "ajustes_inventario_id_tipo_movimiento_fkey" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "tipos_movimiento"("id_tipo_movimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajustes_inventario" ADD CONSTRAINT "ajustes_inventario_usuario_registro_fkey" FOREIGN KEY ("usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ajustes_inventario" ADD CONSTRAINT "detalle_ajustes_inventario_id_ajuste_fkey" FOREIGN KEY ("id_ajuste") REFERENCES "ajustes_inventario"("id_ajuste") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ajustes_inventario" ADD CONSTRAINT "detalle_ajustes_inventario_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_tipo_movimiento_fkey" FOREIGN KEY ("id_tipo_movimiento") REFERENCES "tipos_movimiento"("id_tipo_movimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_usuario_registro_fkey" FOREIGN KEY ("usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_compra_fkey" FOREIGN KEY ("id_compra") REFERENCES "compras"("id_compra") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id_venta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_id_ajuste_fkey" FOREIGN KEY ("id_ajuste") REFERENCES "ajustes_inventario"("id_ajuste") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago" ADD CONSTRAINT "metodos_pago_id_tipo_metodo_fkey" FOREIGN KEY ("id_tipo_metodo") REFERENCES "tipos_metodo_pago"("id_tipo_metodo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_usuario_vendedor_fkey" FOREIGN KEY ("id_usuario_vendedor") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_estado_pedido_fkey" FOREIGN KEY ("id_estado_pedido") REFERENCES "estados_pedido"("id_estado_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_descuento_fkey" FOREIGN KEY ("id_descuento") REFERENCES "descuentos"("id_descuento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ventas" ADD CONSTRAINT "detalle_ventas_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id_venta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_ventas" ADD CONSTRAINT "detalle_ventas_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id_venta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_metodo_pago_fkey" FOREIGN KEY ("id_metodo_pago") REFERENCES "metodos_pago"("id_metodo_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_registro_fkey" FOREIGN KEY ("usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_detalle" ADD CONSTRAINT "pagos_detalle_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id_pago") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_detalle" ADD CONSTRAINT "pagos_detalle_id_metodo_pago_fkey" FOREIGN KEY ("id_metodo_pago") REFERENCES "metodos_pago"("id_metodo_pago") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id_venta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_usuario_registro_fkey" FOREIGN KEY ("usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_credito_resumen" ADD CONSTRAINT "clientes_credito_resumen_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id_venta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_usuario_registro_fkey" FOREIGN KEY ("usuario_registro") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_devoluciones" ADD CONSTRAINT "detalle_devoluciones_id_devolucion_fkey" FOREIGN KEY ("id_devolucion") REFERENCES "devoluciones"("id_devolucion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_devoluciones" ADD CONSTRAINT "detalle_devoluciones_id_detalle_venta_fkey" FOREIGN KEY ("id_detalle_venta") REFERENCES "detalle_ventas"("id_detalle_venta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_devoluciones" ADD CONSTRAINT "detalle_devoluciones_id_variante_fkey" FOREIGN KEY ("id_variante") REFERENCES "variantes_producto"("id_variante") ON DELETE RESTRICT ON UPDATE CASCADE;
