/**
 * Archivo central para registrar todas las rutas de la aplicación.
 * Importa las rutas de cada módulo y las monta en un enrutador principal.
 */

const { Router } = require('express');

// --- IMPORTACIÓN DE RUTAS DE LOS MÓDULOS ---
const authRoutes = require('./modules/auth/authRoutes');
const usuariosRoutes = require('./modules/usuarios/usuariosRoutes');
const rolesRoutes = require('./modules/roles/rolesRoutes');
const categoriasRoutes = require('./modules/categorias/categoriasRoutes');
const productosRoutes = require('./modules/productos/productosRoutes');
const variantesRoutes = require('./modules/variantes/variantesRoutes');
const coloresRoutes = require('./modules/colores/coloresRoutes');
const tallasRoutes = require('./modules/tallas/tallasRoutes');
const proveedoresRoutes = require('./modules/proveedores/proveedoresRoutes');
const comprasRoutes = require('./modules/compras/comprasRoutes');
const ventasRoutes = require('./modules/ventas/ventasRoutes');
const ventasCreditoRoutes = require('./modules/ventasCredito/ventasCreditoRoutes');
const pagosRoutes = require('./modules/pagos/pagosRoutes');
const creditosRoutes = require('./modules/creditos/creditosRoutes');
const devolucionesRoutes = require('./modules/devoluciones/devolucionesRoutes');
const inventarioRoutes = require('./modules/inventario/inventarioRoutes');
const movimientosRoutes = require('./modules/movimientos/movimientosRoutes');
const tiposMovimientoRoutes = require('./modules/tiposMovimiento/tiposMovimientoRoutes');
const ajustesInventarioRoutes = require('./modules/ajustesInventario/ajustesInventarioRoutes');
const reportesRoutes = require('./modules/reportes/reportesRoutes');
const imagenesRoutes = require('./modules/imagenes/imagenesRoutes');
const descuentosRoutes = require('./modules/descuentos/descuentosRoutes');
const galeriaRoutes = require('./modules/galeria/galeriaRoutes');
const estadosPedidoRoutes = require('./modules/estadosPedido/estadosPedidoRoutes');
const metodosPagoRoutes = require('./modules/metodosPago/metodosPagoRoutes');
const publicRoutes = require('./modules/public/publicRoutes');

// Agrega aquí más importaciones de rutas a medida que se creen nuevos módulos...

// Crear una instancia del enrutador principal
const router = Router();

// --- RUTA DE VERIFICACIÓN DE ESTADO ---
router.get('/status', (req, res) => {
  res.status(200).json({
    estado: 'activo',
    mensaje: 'API funcionando correctamente.',
    timestamp: new Date().toISOString()
  });
});


// --- REGISTRO DE RUTAS DE MÓDULOS ---
// Cada conjunto de rutas de un módulo se registra bajo un prefijo.
router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/roles', rolesRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/variantes', variantesRoutes);
router.use('/colores', coloresRoutes);
router.use('/tallas', tallasRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/compras', comprasRoutes);
router.use('/ventas', ventasRoutes);
router.use('/ventas-credito', ventasCreditoRoutes);
router.use('/pagos', pagosRoutes);
router.use('/creditos', creditosRoutes);
router.use('/devoluciones', devolucionesRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/movimientos', movimientosRoutes);
router.use('/tipos-movimiento', tiposMovimientoRoutes);
router.use('/ajustes-inventario', ajustesInventarioRoutes);
router.use('/reportes', reportesRoutes);
router.use('/imagenes', imagenesRoutes);
router.use('/descuentos', descuentosRoutes);
router.use('/galeria', galeriaRoutes);
router.use('/estados-pedido', estadosPedidoRoutes);
router.use('/metodos-pago', metodosPagoRoutes);
router.use('/public', publicRoutes);
// Agrega aquí más registros de rutas...

module.exports = router;
