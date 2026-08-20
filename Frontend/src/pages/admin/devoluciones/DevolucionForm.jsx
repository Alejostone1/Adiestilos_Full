import React, { useState, useEffect } from 'react';
import { X, Search, Package, AlertCircle, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { devolucionesApi } from '../../../api/devolucionesApi';
import { ventasApi } from '../../../api/ventasApi';

/**
 * Formulario Wizard para crear devoluciones paso a paso
 * Paso 1: Buscar y seleccionar venta
 * Paso 2: Revisar datos de la venta y productos
 * Paso 3: Seleccionar productos a devolver
 * Paso 4: Motivo y confirmación
 */
const DevolucionForm = ({ devolucion, accion, onClose, onSuccess }) => {
  // Estados del wizard
  const [pasoActual, setPasoActual] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [buscandoVenta, setBuscandoVenta] = useState(false);
  
  // Datos de la venta seleccionada
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  
  // Productos a devolver
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    motivo: '',
    observaciones: ''
  });

  // Estados de validación
  const [errores, setErrores] = useState({});

  // Inicializar si estamos editando
  useEffect(() => {
    if (accion === 'editar' && devolucion) {
      setVentaSeleccionada(devolucion.venta);
      setFormData({
        motivo: devolucion.motivo,
        observaciones: devolucion.observaciones || ''
      });
      setProductosSeleccionados(devolucion.detalleDevoluciones?.map(detalle => ({
        idDetalleVenta: detalle.idDetalleVenta,
        idVariante: detalle.idVariante,
        cantidadDevuelta: detalle.cantidadDevuelta,
        cantidadMaxima: detalle.detalleVenta?.cantidad || 0,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal,
        variante: detalle.variante,
        seleccionado: true
      })) || []);
      setPasoActual(4); // Ir directamente al paso de confirmación
    }
  }, [accion, devolucion]);

  // Buscar ventas
  const buscarVentas = async (termino) => {
    if (!termino || termino.length < 3) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      setBuscandoVenta(true);
      const response = await ventasApi.getVentas({
        busqueda: termino,
        limite: 10,
        estado: 'completada'
      });
      
      setResultadosBusqueda(response.datos || []);
    } catch (error) {
      console.error('Error al buscar ventas:', error);
      setResultadosBusqueda([]);
    } finally {
      setBuscandoVenta(false);
    }
  };

  // Manejar búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (terminoBusqueda && pasoActual === 1) {
        buscarVentas(terminoBusqueda);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [terminoBusqueda, pasoActual]);

  // Seleccionar venta
  const seleccionarVenta = async (venta) => {
    try {
      setCargando(true);
      setVentaSeleccionada(venta);
      setTerminoBusqueda(venta.numeroFactura);
      setResultadosBusqueda([]);
      
      // Cargar detalles completos de la venta
      const response = await ventasApi.getVentaById(venta.idVenta);
      const ventaCompleta = response?.datos || response;
      setVentaSeleccionada(ventaCompleta);

      const productos = ventaCompleta.detalleVentas?.map(detalle => ({
        idDetalleVenta: detalle.idDetalleVenta,
        idVariante: detalle.idVariante,
        cantidadDevuelta: 0,
        cantidadMaxima: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: 0,
        variante: detalle.variante,
        seleccionado: false
      })) || [];
      
      setProductosSeleccionados(productos);
      setPasoActual(2); // Avanzar al paso 2
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
      setErrores({ general: 'Error al cargar los detalles de la venta' });
    } finally {
      setCargando(false);
    }
  };

  // Actualizar cantidad devuelta
  const actualizarCantidadDevuelta = (index, cantidad) => {
    const nuevaCantidad = parseFloat(cantidad) || 0;
    const productos = [...productosSeleccionados];
    const producto = productos[index];
    
    if (nuevaCantidad > producto.cantidadMaxima) {
      setErrores(prev => ({
        ...prev,
        [`cantidad_${index}`]: `No puede devolver más de ${producto.cantidadMaxima} unidades`
      }));
      return;
    }
    
    // Limpiar error
    setErrores(prev => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores[`cantidad_${index}`];
      return nuevosErrores;
    });
    
    producto.cantidadDevuelta = nuevaCantidad;
    producto.subtotal = nuevaCantidad * producto.precioUnitario;
    producto.seleccionado = nuevaCantidad > 0;
    
    setProductosSeleccionados(productos);
  };

  // Navegación del wizard
  const siguientePaso = () => {
    if (pasoActual === 1 && !ventaSeleccionada) {
      setErrores({ general: 'Debe seleccionar una venta' });
      return;
    }
    
    if (pasoActual === 3) {
      if (!validarProductosSeleccionados()) return;
    }
    
    if (pasoActual === 4) {
      if (!validarFormularioFinal()) return;
    }
    
    setErrores({});
    if (pasoActual < 4) {
      setPasoActual(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
      setErrores({});
    }
  };

  // Validaciones
  const validarProductosSeleccionados = () => {
    const productosConCantidad = productosSeleccionados.filter(p => p.cantidadDevuelta > 0);
    if (productosConCantidad.length === 0) {
      setErrores({ productos: 'Debe seleccionar al menos un producto para devolver' });
      return false;
    }
    return true;
  };

  const validarFormularioFinal = () => {
    const nuevosErrores = {};
    
    if (!formData.motivo.trim()) {
      nuevosErrores.motivo = 'El motivo es obligatorio';
    }
    
    const productosConCantidad = productosSeleccionados.filter(p => p.cantidadDevuelta > 0);
    if (productosConCantidad.length === 0) {
      nuevosErrores.productos = 'Debe seleccionar al menos un producto para devolver';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validarFormularioFinal()) return;
    
    try {
      setCargando(true);
      
      const productosParaDevolucion = productosSeleccionados
        .filter(p => p.cantidadDevuelta > 0)
        .map(({ idDetalleVenta, cantidadDevuelta }) => ({
          idDetalleVenta,
          cantidadDevuelta
        }));
      
      const datosParaEnviar = {
        idVenta: ventaSeleccionada.idVenta,
        motivo: formData.motivo,
        observaciones: formData.observaciones,
        detalleDevoluciones: productosParaDevolucion
      };
      
      if (accion === 'crear') {
        await devolucionesApi.createDevolucion(datosParaEnviar);
      } else {
        await devolucionesApi.updateDevolucion(devolucion.idDevolucion, datosParaEnviar);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error al guardar devolución:', error);
      setErrores({ general: error.message || 'Error al guardar la devolución' });
    } finally {
      setCargando(false);
    }
  };

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = productosSeleccionados.reduce((sum, p) => sum + p.subtotal, 0);
    return { subtotal, impuestos: 0, total: subtotal };
  };

  const totales = calcularTotales();

  // Formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  // Renderizar paso 1: Buscar venta
  const renderPaso1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Paso 1: Buscar Venta</h3>
        <p className="text-gray-600">Busque la venta por número de factura o por cliente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buscador por número de factura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Buscar por Número de Factura
            </span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Ej: FACT-001, VTA-2024..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {buscandoVenta && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Buscador por cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Buscar por Cliente
            </span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Nombre o apellido del cliente..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {buscandoVenta && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Resultados de búsqueda */}
      {resultadosBusqueda.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              {resultadosBusqueda.length} ventas encontradas
            </p>
          </div>
          {resultadosBusqueda.map((venta) => (
            <div
              key={venta.idVenta}
              onClick={() => seleccionarVenta(venta)}
              className="px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {venta.numeroFactura}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(venta.creadoEn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">
                      {venta.usuarioCliente?.nombres} {venta.usuarioCliente?.apellidos}
                    </p>
                    <p className="text-sm text-gray-500">
                      {venta.usuarioCliente?.correoElectronico}
                    </p>
                    <p className="text-xs text-gray-400">
                      Tel: {venta.usuarioCliente?.telefono || 'No registrado'}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-lg text-gray-900">{formatearMoneda(venta.total)}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {venta.estadoPago === 'pagado' ? 'Pagada' : 'Pendiente'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {venta.detalleVentas?.length || 0} productos
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {errores.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{errores.general}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar paso 2: Revisar venta
  const renderPaso2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Paso 2: Revisar Venta</h3>
        <p className="text-gray-600">Verifique los datos de la venta y los productos comprados</p>
      </div>

      {ventaSeleccionada && (
        <div className="space-y-4">
          {/* Información completa de la venta */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Información Completa de la Venta
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Número Factura:</span>
                <p className="font-bold text-gray-900 text-lg">{ventaSeleccionada.numeroFactura}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Fecha Venta:</span>
                <p className="font-medium text-gray-900">
                  {new Date(ventaSeleccionada.creadoEn).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Estado Pago:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  ventaSeleccionada.estadoPago === 'pagado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {ventaSeleccionada.estadoPago === 'pagado' ? 'Pagada' : 'Pendiente'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Venta:</span>
                <p className="font-bold text-lg text-green-600">{formatearMoneda(ventaSeleccionada.total)}</p>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-medium text-green-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Información del Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Nombre Completo:</span>
                <p className="font-medium text-gray-900">
                  {ventaSeleccionada.usuarioCliente?.nombres} {ventaSeleccionada.usuarioCliente?.apellidos}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Contacto:</span>
                <p className="font-medium text-gray-900">{ventaSeleccionada.usuarioCliente?.correoElectronico}</p>
                <p className="text-sm text-gray-500">{ventaSeleccionada.usuarioCliente?.telefono || 'No registrado'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Dirección:</span>
                <p className="font-medium text-gray-900">{ventaSeleccionada.direccionEntrega || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Productos vendidos con variantes y cantidades */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos Vendidos ({productosSeleccionados.length} items)
            </h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {productosSeleccionados.map((producto, index) => (
                  <div key={producto.idDetalleVenta} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Nombre del producto */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {producto.variante?.producto?.nombreProducto}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({producto.variante?.producto?.codigoReferencia})
                            </span>
                          </div>
                          
                          {/* Variantes específicas */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            {producto.variante?.color?.nombreColor && (
                              <span className="flex items-center gap-1">
                                <div className={`w-3 h-3 rounded-full border border-gray-300`} 
                                     style={{ backgroundColor: producto.variante.color.codigoHex || '#ccc' }}></div>
                                Color: {producto.variante.color.nombreColor}
                              </span>
                            )}
                            {producto.variante?.talla?.nombreTalla && (
                              <span>Talla: {producto.variante.talla.nombreTalla}</span>
                            )}
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">SKU: {producto.variante?.codigoSku}</span>
                          </div>
                          
                          {/* Detalles de compra */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Cantidad comprada:</span>
                              <p className="font-medium text-gray-900">{producto.cantidadMaxima} unidades</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Precio unitario:</span>
                              <p className="font-medium text-gray-900">{formatearMoneda(producto.precioUnitario)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total línea:</span>
                              <p className="font-medium text-gray-900">
                                {formatearMoneda(producto.cantidadMaxima * producto.precioUnitario)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen de la venta */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Productos en esta Factura:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{productosSeleccionados.length}</span>
                <span className="text-gray-600 ml-2">productos diferentes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar paso 3: Seleccionar productos
  const renderPaso3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Paso 3: Seleccionar Productos a Devolver</h3>
        <p className="text-gray-600">Elija los productos y cantidades exactas que fueron comprados en esta factura</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">
            Solo puede devolver productos y cantidades que fueron comprados en esta factura
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {productosSeleccionados.map((producto, index) => (
          <div key={producto.idDetalleVenta} className={`border rounded-lg p-4 transition-all ${
            producto.cantidadDevuelta > 0 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                {/* Header del producto */}
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {producto.variante?.producto?.nombreProducto}
                  </span>
                  {producto.cantidadDevuelta > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Seleccionado para devolución
                    </span>
                  )}
                </div>
                
                {/* Información de variantes */}
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">Código:</span>
                    <span className="font-medium text-gray-900">{producto.variante?.producto?.codigoReferencia}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">SKU:</span>
                    <span className="font-medium text-gray-900">{producto.variante?.codigoSku}</span>
                  </div>
                  {(producto.variante?.color?.nombreColor || producto.variante?.talla?.nombreTalla) && (
                    <div className="flex items-center gap-4">
                      {producto.variante?.color?.nombreColor && (
                        <span className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full border border-gray-300`} 
                               style={{ backgroundColor: producto.variante.color.codigoHex || '#ccc' }}></div>
                          Color: {producto.variante.color.nombreColor}
                        </span>
                      )}
                      {producto.variante?.talla?.nombreTalla && (
                        <span>Talla: {producto.variante.talla.nombreTalla}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Información de compra y validación */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Comprado:</span>
                      <p className="font-medium text-gray-900">{producto.cantidadMaxima} und</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Precio:</span>
                      <p className="font-medium text-gray-900">{formatearMoneda(producto.precioUnitario)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ya devuelto:</span>
                      <p className="font-medium text-orange-600">0 und</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Disponible para devolver:</span>
                      <p className="font-medium text-green-600">{producto.cantidadMaxima} und</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Control de cantidad */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Cantidad a devolver:
                </label>
                <input
                  type="number"
                  min="0"
                  max={producto.cantidadMaxima}
                  step="0.01"
                  value={producto.cantidadDevuelta}
                  onChange={(e) => actualizarCantidadDevuelta(index, e.target.value)}
                  className={`w-24 px-3 py-2 border rounded-lg text-center font-medium transition-colors ${
                    producto.cantidadDevuelta > 0
                      ? 'border-green-300 bg-green-50 text-green-800'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <span className="text-sm text-gray-500 font-medium">
                  / {producto.cantidadMaxima} und.
                </span>
                
                {/* Indicador de stock */}
                {producto.cantidadDevuelta > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Se devolverá al inventario</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Errores de validación */}
            {errores[`cantidad_${index}`] && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{errores[`cantidad_${index}`]}</span>
                </div>
              </div>
            )}
            
            {/* Subtotal de devolución */}
            {producto.cantidadDevuelta > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Subtotal devolución:</span>
                  <span className="font-bold text-green-600">{formatearMoneda(producto.subtotal)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {producto.cantidadDevuelta} und × {formatearMoneda(producto.precioUnitario)}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {errores.productos && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{errores.productos}</span>
            </div>
          </div>
        )}
      </div>

      {/* Resumen de devolución y control de inventario */}
      {totales.total > 0 && (
        <div className="space-y-4">
          {/* Resumen parcial */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-medium text-green-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Resumen de Devolución
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Productos seleccionados:</span>
                <span className="font-medium text-gray-900">
                  {productosSeleccionados.filter(p => p.cantidadDevuelta > 0).length} productos
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total unidades a devolver:</span>
                <span className="font-medium text-gray-900">
                  {productosSeleccionados.reduce((sum, p) => sum + p.cantidadDevuelta, 0)} und.
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor total a devolver:</span>
                <span className="font-bold text-lg text-green-600">{formatearMoneda(totales.total)}</span>
              </div>
            </div>
          </div>

          {/* Control de inventario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Control de Inventario
            </h4>
            <div className="space-y-3">
              {productosSeleccionados.filter(p => p.cantidadDevuelta > 0).map((producto, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{producto.variante?.producto?.nombreProducto}</span>
                    <span className="text-gray-500">({producto.variante?.codigoSku})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-medium">
                      +{producto.cantidadDevuelta} und.
                    </span>
                    <span className="text-gray-500">al inventario</span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-blue-200 mt-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Al confirmar, estas cantidades se incrementarán automáticamente en el inventario 
                    y se registrarán los movimientos correspondientes.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizar paso 4: Confirmación
  const renderPaso4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Paso 4: Confirmar Devolución</h3>
        <p className="text-gray-600">Revise el motivo y confirme la devolución</p>
      </div>

      {/* Motivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Motivo de Devolución <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.motivo}
          onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
          placeholder="Describa el motivo de la devolución..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errores.motivo && (
          <p className="mt-1 text-sm text-red-600">{errores.motivo}</p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (Opcional)
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
          placeholder="Notas adicionales sobre la devolución..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Resumen final */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Resumen Final de Devolución</h4>
        
        {/* Información de la venta */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Venta: <span className="font-medium text-gray-900">{ventaSeleccionada?.numeroFactura}</span></p>
          <p className="text-sm text-gray-600">Cliente: <span className="font-medium text-gray-900">
            {ventaSeleccionada?.usuarioCliente?.nombres} {ventaSeleccionada?.usuarioCliente?.apellidos}
          </span></p>
        </div>

        {/* Productos seleccionados */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Productos a devolver:</p>
          <div className="space-y-1">
            {productosSeleccionados.filter(p => p.cantidadDevuelta > 0).map((producto, index) => (
              <div key={index} className="text-sm text-gray-600 flex justify-between">
                <span>{producto.variante?.producto?.nombreProducto} ({producto.cantidadDevuelta} und)</span>
                <span>{formatearMoneda(producto.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Devolución:</span>
            <span className="text-lg font-bold text-blue-600">{formatearMoneda(totales.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar indicador de pasos
  const renderIndicadorPasos = () => {
    const pasos = [
      { numero: 1, titulo: 'Buscar Venta', icono: Search },
      { numero: 2, titulo: 'Revisar Venta', icono: ShoppingCart },
      { numero: 3, titulo: 'Seleccionar Productos', icono: Package },
      { numero: 4, titulo: 'Confirmar', icono: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {pasos.map((paso, index) => (
          <div key={paso.numero} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
              pasoActual >= paso.numero
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}>
              <paso.icono className="w-5 h-5" />
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                pasoActual >= paso.numero ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {paso.titulo}
              </p>
            </div>
            {index < pasos.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                pasoActual > paso.numero ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {accion === 'crear' ? 'Nueva Devolución' : 'Editar Devolución'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Asistente paso a paso para {accion === 'crear' ? 'crear' : 'actualizar'} la devolución
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Indicador de pasos */}
          {renderIndicadorPasos()}

          {/* Error general */}
          {errores.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{errores.general}</span>
              </div>
            </div>
          )}

          {/* Contenido del paso actual */}
          {pasoActual === 1 && renderPaso1()}
          {pasoActual === 2 && renderPaso2()}
          {pasoActual === 3 && renderPaso3()}
          {pasoActual === 4 && renderPaso4()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={pasoAnterior}
              disabled={pasoActual === 1}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>

              {pasoActual === 4 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={cargando}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {cargando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Devolución
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={siguientePaso}
                  disabled={cargando}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevolucionForm;
