-- ============================================================================
-- SCRIPT DE CORRECCIÓN: Créditos Existentes con Lógica Incorrecta
-- ============================================================================
-- ADAPTADO A TU BASE DE DATOS
-- Métodos de pago con tipo "credito_tienda" (id_tipo_metodo = 5):
--   - ID 7: "Crédito Tienda"
-- ============================================================================

-- PASO 1: BACKUP (OBLIGATORIO)
CREATE TABLE creditos_backup_20260126 AS SELECT * FROM creditos;
CREATE TABLE clientes_credito_resumen_backup_20260126 AS SELECT * FROM clientes_credito_resumen;

-- ============================================================================
-- PASO 2: ANÁLISIS - Identificar créditos con problemas
-- ============================================================================

SELECT 
    c.id_credito,
    c.id_venta,
    v.numero_factura,
    CONCAT(u.nombres, ' ', u.apellidos) AS cliente,
    c.monto_total AS credito_registrado,
    c.saldo_pendiente AS saldo_actual,
    -- Calcular cuánto REALMENTE es crédito (tipo credito_tienda = 5)
    COALESCE(SUM(CASE 
        WHEN tmp.id_tipo_metodo = 5  -- Tipo "credito_tienda"
        THEN p.monto 
        ELSE 0 
    END), 0) AS credito_real,
    -- Calcular cuánto fue pago inicial (NO crédito)
    COALESCE(SUM(CASE 
        WHEN tmp.id_tipo_metodo != 5 
        THEN p.monto 
        ELSE 0 
    END), 0) AS pago_inicial_real,
    -- Diferencia (error)
    c.monto_total - COALESCE(SUM(CASE 
        WHEN tmp.id_tipo_metodo = 5 
        THEN p.monto 
        ELSE 0 
    END), 0) AS diferencia_error,
    -- Métodos usados
    GROUP_CONCAT(DISTINCT mp.nombre_metodo ORDER BY p.id_pago SEPARATOR ', ') AS metodos_usados
FROM creditos c
INNER JOIN ventas v ON v.id_venta = c.id_venta
INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
LEFT JOIN pagos p ON p.id_venta = v.id_venta AND p.tipo_pago = 'inicial'
LEFT JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
LEFT JOIN tipos_metodo_pago tmp ON tmp.id_tipo_metodo = mp.id_tipo_metodo
WHERE c.estado IN ('activo', 'vencido') -- Solo créditos no pagados
GROUP BY c.id_credito, c.id_venta, v.numero_factura, u.nombres, u.apellidos, c.monto_total, c.saldo_pendiente
HAVING diferencia_error != 0 -- Solo los que tienen error
ORDER BY c.id_credito;

-- ============================================================================
-- PASO 3: VER DETALLE DE PAGOS DE UNA VENTA ESPECÍFICA
-- ============================================================================

-- Cambiar el ID de venta para ver sus pagos
SELECT 
    p.id_pago,
    mp.nombre_metodo,
    tmp.nombre AS tipo_metodo,
    tmp.id_tipo_metodo,
    p.monto,
    p.tipo_pago,
    p.fecha_pago,
    CASE 
        WHEN tmp.id_tipo_metodo = 5 THEN '✅ ES CRÉDITO'
        ELSE '❌ NO ES CRÉDITO'
    END AS genera_credito
FROM pagos p
INNER JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
INNER JOIN tipos_metodo_pago tmp ON tmp.id_tipo_metodo = mp.id_tipo_metodo
WHERE p.id_venta = 1 -- CAMBIAR por ID de venta a verificar
ORDER BY p.fecha_pago;

-- ============================================================================
-- PASO 4: CORRECCIÓN - Actualizar créditos con valores correctos
-- ============================================================================

UPDATE creditos c
INNER JOIN (
    SELECT 
        v.id_venta,
        -- Monto real financiado (solo tipo credito_tienda = 5)
        COALESCE(SUM(CASE 
            WHEN tmp.id_tipo_metodo = 5 
            THEN p.monto 
            ELSE 0 
        END), 0) AS monto_credito_real,
        -- Monto pagado al contado (otros tipos)
        COALESCE(SUM(CASE 
            WHEN tmp.id_tipo_metodo != 5 
            THEN p.monto 
            ELSE 0 
        END), 0) AS monto_inicial_real
    FROM ventas v
    LEFT JOIN pagos p ON p.id_venta = v.id_venta AND p.tipo_pago = 'inicial'
    LEFT JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
    LEFT JOIN tipos_metodo_pago tmp ON tmp.id_tipo_metodo = mp.id_tipo_metodo
    WHERE v.id_venta IN (SELECT id_venta FROM creditos WHERE estado IN ('activo', 'vencido'))
    GROUP BY v.id_venta
) datos ON datos.id_venta = c.id_venta
SET 
    c.monto_inicial = datos.monto_inicial_real,
    c.monto_credito = datos.monto_credito_real,
    c.monto_total = datos.monto_credito_real,
    -- Recalcular saldo: monto_credito - abonos realizados
    c.saldo_pendiente = datos.monto_credito_real - c.total_abonado,
    c.actualizado_en = NOW()
WHERE c.estado IN ('activo', 'vencido');

-- ============================================================================
-- PASO 5: ACTUALIZAR RESUMEN DE CLIENTES
-- ============================================================================

UPDATE clientes_credito_resumen ccr
INNER JOIN (
    SELECT 
        c.id_usuario,
        SUM(c.monto_total) AS credito_total_correcto,
        SUM(c.saldo_pendiente) AS saldo_total_correcto,
        SUM(c.total_abonado) AS total_abonado_correcto,
        COUNT(CASE WHEN c.estado = 'activo' THEN 1 END) AS creditos_activos,
        COUNT(CASE WHEN c.estado = 'pagado' THEN 1 END) AS creditos_pagados,
        COUNT(CASE WHEN c.estado = 'vencido' THEN 1 END) AS creditos_vencidos
    FROM creditos c
    GROUP BY c.id_usuario
) totales ON totales.id_usuario = ccr.id_usuario
SET 
    ccr.credito_total = totales.credito_total_correcto,
    ccr.saldo_total = totales.saldo_total_correcto,
    ccr.total_abonado = totales.total_abonado_correcto,
    ccr.cantidad_creditos_activos = totales.creditos_activos,
    ccr.cantidad_creditos_pagados = totales.creditos_pagados,
    ccr.cantidad_creditos_vencidos = totales.creditos_vencidos,
    ccr.fecha_actualizacion = NOW();

-- ============================================================================
-- PASO 6: VERIFICACIÓN - Comprobar que todo quedó correcto
-- ============================================================================

-- Resumen general
SELECT 
    'Créditos corregidos' AS descripcion,
    COUNT(*) AS cantidad,
    SUM(c.monto_total) AS total_creditos,
    SUM(c.saldo_pendiente) AS total_saldo_pendiente
FROM creditos c
WHERE c.estado IN ('activo', 'vencido');

-- Detalle de créditos después de corrección
SELECT 
    c.id_credito,
    c.id_venta,
    v.numero_factura,
    CONCAT(u.nombres, ' ', u.apellidos) AS cliente,
    c.monto_inicial AS pago_inicial,
    c.monto_credito AS monto_financiado,
    c.monto_total AS total_credito,
    c.total_abonado AS abonos,
    c.saldo_pendiente,
    c.estado,
    c.fecha_vencimiento
FROM creditos c
INNER JOIN ventas v ON v.id_venta = c.id_venta
INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
WHERE c.estado IN ('activo', 'vencido')
ORDER BY c.id_credito;

-- ============================================================================
-- PASO 7: ELIMINAR CRÉDITOS QUE NO DEBERÍAN EXISTIR (OPCIONAL)
-- ============================================================================

-- Identificar créditos que NO tienen pagos con tipo "credito_tienda"
SELECT 
    c.id_credito,
    c.id_venta,
    v.numero_factura,
    CONCAT(u.nombres, ' ', u.apellidos) AS cliente,
    c.monto_total,
    COALESCE(SUM(CASE 
        WHEN tmp.id_tipo_metodo = 5 
        THEN p.monto 
        ELSE 0 
    END), 0) AS credito_real,
    GROUP_CONCAT(DISTINCT mp.nombre_metodo SEPARATOR ', ') AS metodos_usados
FROM creditos c
INNER JOIN ventas v ON v.id_venta = c.id_venta
INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
LEFT JOIN pagos p ON p.id_venta = v.id_venta AND p.tipo_pago = 'inicial'
LEFT JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
LEFT JOIN tipos_metodo_pago tmp ON tmp.id_tipo_metodo = mp.id_tipo_metodo
GROUP BY c.id_credito, c.id_venta, v.numero_factura, u.nombres, u.apellidos, c.monto_total
HAVING credito_real = 0; -- Créditos sin pagos tipo "credito_tienda"

-- SOLO SI CONFIRMAS QUE DEBEN ELIMINARSE, ejecutar:
/*
DELETE FROM creditos WHERE id_credito IN (
    SELECT id_credito FROM (
        SELECT c.id_credito
        FROM creditos c
        LEFT JOIN pagos p ON p.id_venta = c.id_venta AND p.tipo_pago = 'inicial'
        LEFT JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
        LEFT JOIN tipos_metodo_pago tmp ON tmp.id_tipo_metodo = mp.id_tipo_metodo
        GROUP BY c.id_credito
        HAVING COALESCE(SUM(CASE WHEN tmp.id_tipo_metodo = 5 THEN p.monto ELSE 0 END), 0) = 0
    ) AS creditos_invalidos
);
*/

-- ============================================================================
-- PASO 8: VERIFICAR MÉTODOS DE PAGO MIXTOS (ADVERTENCIA)
-- ============================================================================

-- Ver si hay ventas usando métodos mixtos (IDs 8-12)
-- Estos métodos NO especifican cuánto es crédito y cuánto es contado
SELECT 
    v.id_venta,
    v.numero_factura,
    mp.nombre_metodo,
    p.monto,
    '⚠️ MÉTODO MIXTO - Requiere pagos separados' AS advertencia
FROM pagos p
INNER JOIN ventas v ON v.id_venta = p.id_venta
INNER JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
WHERE p.id_metodo_pago IN (8, 9, 10, 11, 12) -- Métodos mixtos
ORDER BY v.id_venta, p.fecha_pago;

-- ============================================================================
-- RESTAURAR BACKUP (si algo sale mal)
-- ============================================================================

/*
DROP TABLE creditos;
CREATE TABLE creditos AS SELECT * FROM creditos_backup_20260126;

DROP TABLE clientes_credito_resumen;
CREATE TABLE clientes_credito_resumen AS SELECT * FROM clientes_credito_resumen_backup_20260126;
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
MÉTODOS DE PAGO EN TU BD:

✅ GENERAN CRÉDITO (id_tipo_metodo = 5):
   - ID 7: "Crédito Tienda"

❌ NO GENERAN CRÉDITO:
   - ID 1: Efectivo
   - ID 2: Tarjeta Crédito
   - ID 3: Tarjeta Débito
   - ID 4: PSE
   - ID 5: Nequi
   - ID 6: Daviplata

⚠️ MÉTODOS MIXTOS (NO RECOMENDADOS):
   - ID 8: Efectivo + Crédito
   - ID 9: Tarjeta Crédito + Crédito
   - ID 10: Tarjeta Débito + Crédito
   - ID 11: Efectivo + Tarjeta
   - ID 12: Transferencia + Crédito

RECOMENDACIÓN:
- Usar pagos separados en lugar de métodos mixtos
- Ejemplo: En vez de "Efectivo + Crédito" por $35,700,
  registrar dos pagos: Efectivo $10,000 + Crédito Tienda $25,700
*/
