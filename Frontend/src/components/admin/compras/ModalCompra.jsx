import React, { useState, useEffect } from 'react';
import { 
  FiX, FiChevronRight, FiChevronLeft, FiCheck, FiShoppingCart, 
  FiPackage, FiUser, FiSearch, FiPlus, FiMinus, FiTrash2,
  FiTag, FiPercent, FiDollarSign, FiBox, FiAlertCircle
} from 'react-icons/fi';
import { proveedoresApi } from '../../../api/proveedoresApi';
import comprasApi from '../../../api/comprasApi';
import Swal from 'sweetalert2';

// Función helper para formatear precios en formato colombiano (sin decimales, con separador de miles)
const formatearPrecioColombia = (valor) => {
  const numero = Math.round(Number(valor) || 0);
  return numero.toLocaleString('es-CO');
};

const ModalCompra = ({ isOpen, onClose, onCompraCreada }) => {
  const [paso, setPaso] = useState(1);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [numeroCompraManual, setNumeroCompraManual] = useState('FAC-');
  const [notas, setNotas] = useState('');
  const [productosExpandidos, setProductosExpandidos] = useState({});
  const [impuestos, setImpuestos] = useState(0); // Porcentaje de impuestos (ej: 19 para 19%)

  // Cargar proveedores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarProveedores();
    } else {
      // Reset al cerrar
      setPaso(1);
      setProveedorSeleccionado(null);
      setCarrito([]);
      setBusquedaProveedor('');
      setBusquedaProducto('');
      setProductosExpandidos({});
      setImpuestos(0);
      setNumeroCompraManual('FAC-');
      setNotas('');
      setFechaEntrega(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  // Cargar productos cuando se selecciona un proveedor
  useEffect(() => {
    if (proveedorSeleccionado) {
      cargarProductos();
    }
  }, [proveedorSeleccionado]);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      const resultado = await proveedoresApi.listarProveedores();
      setProveedores(resultado.datos || resultado || []);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los proveedores'
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const data = await comprasApi.obtenerProductosPorProveedor(proveedorSeleccionado.idProveedor);
      const productosData = Array.isArray(data) ? data : data.datos || [];
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos'
      });
    } finally {
      setCargando(false);
    }
  };

  const toggleProducto = (idProducto) => {
    setProductosExpandidos(prev => ({
      ...prev,
      [idProducto]: !prev[idProducto]
    }));
  };

  const agregarAlCarrito = (variante, producto) => {
    const existe = carrito.find(item => item.idVariante === variante.idVariante);
    if (existe) {
      Swal.fire({
        icon: 'info',
        title: 'Variante ya agregada',
        text: 'Esta variante ya está en el carrito. Puedes modificar la cantidad desde el resumen.',
        timer: 2000
      });
      return;
    }

    const nuevoItem = {
      idVariante: variante.idVariante,
      producto: producto,
      color: variante.color,
      talla: variante.talla,
      cantidad: 1,
      precioUnitario: Number(variante.precioCosto) || 0,
      stockActual: variante.cantidadStock,
      imagenVariante: variante.imagenesVariantes?.[0]?.rutaImagen || producto.imagenesProductos?.[0]?.rutaImagen,
      descuento: {
        tipo: 'porcentaje', // 'porcentaje' o 'valor_fijo'
        valor: 0,
        montoDescuento: 0
      }
    };

    setCarrito([...carrito, nuevoItem]);
    
    // Animación de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: 'Variante agregada al carrito',
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const actualizarCantidad = (idVariante, cantidad) => {
    const nuevaCantidad = parseInt(cantidad);
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) return;
    
    setCarrito(carrito.map(item => {
      if (item.idVariante === idVariante) {
        const itemActualizado = { ...item, cantidad: nuevaCantidad };
        return calcularDescuentoItem(itemActualizado);
      }
      return item;
    }));
  };

  const actualizarPrecio = (idVariante, precio) => {
    const nuevoPrecio = parseFloat(precio);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) return;
    
    setCarrito(carrito.map(item => {
      if (item.idVariante === idVariante) {
        const itemActualizado = { ...item, precioUnitario: nuevoPrecio };
        return calcularDescuentoItem(itemActualizado);
      }
      return item;
    }));
  };

  const actualizarDescuento = (idVariante, campo, valor) => {
    setCarrito(carrito.map(item => {
      if (item.idVariante === idVariante) {
        const descuentoActualizado = { ...item.descuento, [campo]: valor };
        const itemActualizado = { ...item, descuento: descuentoActualizado };
        return calcularDescuentoItem(itemActualizado);
      }
      return item;
    }));
  };

  const calcularDescuentoItem = (item) => {
    const subtotal = item.cantidad * item.precioUnitario;
    let montoDescuento = 0;

    if (item.descuento.tipo === 'porcentaje') {
      const porcentaje = parseFloat(item.descuento.valor) || 0;
      montoDescuento = (subtotal * porcentaje) / 100;
    } else {
      montoDescuento = parseFloat(item.descuento.valor) || 0;
    }

    // Validar que el descuento no sea mayor al subtotal
    if (montoDescuento > subtotal) {
      montoDescuento = subtotal;
    }

    return {
      ...item,
      descuento: {
        ...item.descuento,
        montoDescuento: montoDescuento
      }
    };
  };

  const eliminarDelCarrito = (idVariante) => {
    setCarrito(carrito.filter(item => item.idVariante !== idVariante));
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
    const descuentoTotal = carrito.reduce((acc, item) => acc + (item.descuento.montoDescuento || 0), 0);
    const baseImponible = subtotal - descuentoTotal;
    const montoImpuestos = (baseImponible * impuestos) / 100;
    const total = baseImponible + montoImpuestos;

    return { subtotal, descuentoTotal, montoImpuestos, total };
  };

  const confirmarCompra = async () => {
    if (!proveedorSeleccionado || carrito.length === 0) return;

    setProcesando(true);
    try {
      const totales = calcularTotales();
      const payload = {
        idProveedor: proveedorSeleccionado.idProveedor,
        fechaCompra: new Date(fechaCompra).toISOString(),
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega).toISOString() : null,
        numeroCompra: numeroCompraManual,
        notas: notas,
        impuestos: totales.montoImpuestos,
        detalleCompras: carrito.map(item => ({
          idVariante: item.idVariante,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuentoLinea: item.descuento.montoDescuento || 0
        }))
      };

      await comprasApi.crearCompra(payload);
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Orden de compra creada exitosamente',
        timer: 2000,
        showConfirmButton: false
      });

      onCompraCreada?.();
      onClose();
    } catch (error) {
      console.error('Error creando compra:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al procesar la compra'
      });
    } finally {
      setProcesando(false);
    }
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombreProveedor.toLowerCase().includes(busquedaProveedor.toLowerCase()) ||
    p.nitCC.toLowerCase().includes(busquedaProveedor.toLowerCase())
  );

  const productosFiltrados = productos.filter(p =>
    p.nombreProducto.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.codigoReferencia.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const siguientePaso = () => {
    if (paso === 1 && !proveedorSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Seleccione un proveedor para continuar'
      });
      return;
    }
    if (paso === 2 && carrito.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Agregue al menos una variante para continuar'
      });
      return;
    }
    setPaso(paso + 1);
  };

  const pasoAnterior = () => {
    setPaso(paso - 1);
  };

  const getIniciales = (nombre) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-600 dark:text-red-400';
    if (stock < 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStockBgColor = (stock) => {
    if (stock === 0) return 'bg-red-100 dark:bg-red-900/20';
    if (stock < 10) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };

  if (!isOpen) return null;

  const totales = calcularTotales();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay con blur */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-lg p-3 rounded-xl shadow-lg">
                  <FiShoppingCart className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Nueva Orden de Compra</h3>
                  <p className="text-sm text-indigo-100 mt-1">Paso {paso} de 3 - {
                    paso === 1 ? 'Seleccionar Proveedor' :
                    paso === 2 ? 'Agregar Productos' :
                    'Confirmar Compra'
                  }</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6 flex items-center justify-between">
              {[
                { num: 1, label: 'Proveedor', icon: FiUser },
                { num: 2, label: 'Productos', icon: FiPackage },
                { num: 3, label: 'Confirmar', icon: FiCheck }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      paso >= step.num
                        ? 'bg-white text-indigo-600 shadow-lg scale-110'
                        : 'bg-white/20 text-white/60 scale-100'
                    }`}>
                      {paso > step.num ? (
                        <FiCheck className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-semibold ${
                      paso >= step.num ? 'text-white' : 'text-indigo-200'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-1.5 mx-3 rounded-full transition-all duration-300 ${
                      paso > step.num ? 'bg-white shadow-md' : 'bg-white/20'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[65vh] overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {/* PASO 1: Selección de Proveedor */}
            {paso === 1 && (
              <div className="space-y-5">
                {/* Buscador */}
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o NIT del proveedor..."
                    value={busquedaProveedor}
                    onChange={(e) => setBusquedaProveedor(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                  />
                </div>

                {/* Grid de Proveedores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {cargando ? (
                    <div className="col-span-full text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500">Cargando proveedores...</p>
                    </div>
                  ) : proveedoresFiltrados.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <FiAlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se encontraron proveedores</p>
                    </div>
                  ) : (
                    proveedoresFiltrados.map(proveedor => (
                      <div
                        key={proveedor.idProveedor}
                        onClick={() => setProveedorSeleccionado(proveedor)}
                        className={`group relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                          proveedorSeleccionado?.idProveedor === proveedor.idProveedor
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex items-start space-x-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                            proveedorSeleccionado?.idProveedor === proveedor.idProveedor
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}>
                            {proveedor.imagenProveedor ? (
                              <img src={proveedor.imagenProveedor} alt={proveedor.nombreProveedor} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              getIniciales(proveedor.nombreProveedor)
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{proveedor.nombreProveedor}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">NIT: {proveedor.nitCC}</p>
                          </div>

                          {/* Check Icon */}
                          {proveedorSeleccionado?.idProveedor === proveedor.idProveedor && (
                            <div className="absolute top-3 right-3">
                              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full p-1.5 shadow-lg animate-pulse">
                                <FiCheck className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info adicional */}
                        <div className="mt-4 space-y-1">
                          {proveedor.telefono && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">📞 {proveedor.telefono}</p>
                          )}
                          {proveedor.correoElectronico && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">✉️ {proveedor.correoElectronico}</p>
                          )}
                        </div>

                        {/* Badge de estado */}
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            proveedor.estado === 'activo'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              proveedor.estado === 'activo' ? 'bg-green-600' : 'bg-gray-600'
                            }`}></span>
                            {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: Selección de Productos y Variantes */}
            {paso === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de Productos */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Buscador */}
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Lista de Productos */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {cargando ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Cargando productos...</p>
                      </div>
                    ) : productosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <FiBox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron productos</p>
                      </div>
                    ) : (
                      productosFiltrados.map(producto => (
                        <div key={producto.idProducto} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg">
                          {/* Header del Producto */}
                          <div 
                            onClick={() => toggleProducto(producto.idProducto)}
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              {/* Imagen del producto */}
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
                                {producto.imagenesProductos?.[0]?.rutaImagen ? (
                                  <img 
                                    src={producto.imagenesProductos[0].rutaImagen} 
                                    alt={producto.nombreProducto}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FiPackage className="h-8 w-8 text-gray-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{producto.nombreProducto}</h4>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Ref: {producto.codigoReferencia}</span>
                                  {producto.categoria && (
                                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs rounded-full">
                                      {producto.categoria.nombreCategoria}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Indicador de variantes */}
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-semibold rounded-lg">
                                  {producto.variantes?.length || 0} variantes
                                </span>
                                <FiChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                                  productosExpandidos[producto.idProducto] ? 'rotate-90' : ''
                                }`} />
                              </div>
                            </div>
                          </div>

                          {/* Variantes (expandible) */}
                          {productosExpandidos[producto.idProducto] && producto.variantes && producto.variantes.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                              <div className="grid grid-cols-1 gap-3">
                                {producto.variantes.map(variante => {
                                  const enCarrito = carrito.some(item => item.idVariante === variante.idVariante);
                                  
                                  return (
                                    <div 
                                      key={variante.idVariante}
                                      className={`p-4 rounded-xl border-2 transition-all ${
                                        enCarrito
                                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-4">
                                        {/* Imagen de variante */}
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {variante.imagenesVariantes?.[0]?.rutaImagen ? (
                                            <img 
                                              src={variante.imagenesVariantes[0].rutaImagen} 
                                              alt="Variante"
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <FiTag className="h-6 w-6 text-gray-500" />
                                          )}
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                          {/* Color */}
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Color</p>
                                            <div className="flex items-center space-x-2">
                                              {variante.color?.codigoHex && (
                                                <div 
                                                  className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                                  style={{ backgroundColor: variante.color.codigoHex }}
                                                />
                                              )}
                                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {variante.color?.nombreColor || 'N/A'}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Talla */}
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Talla</p>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                              {variante.talla?.nombreTalla || 'N/A'}
                                            </span>
                                          </div>

                                          {/* Stock */}
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock</p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-semibold ${getStockBgColor(variante.cantidadStock)} ${getStockColor(variante.cantidadStock)}`}>
                                              {variante.cantidadStock}
                                            </span>
                                          </div>

                                          {/* Precio */}
                                          <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio Costo</p>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                              ${formatearPrecioColombia(variante.precioCosto || 0)}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Botón Agregar */}
                                        <button
                                          onClick={() => agregarAlCarrito(variante, producto)}
                                          disabled={enCarrito}
                                          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                                            enCarrito
                                              ? 'bg-green-500 text-white cursor-not-allowed'
                                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                                          }`}
                                        >
                                          {enCarrito ? (
                                            <>
                                              <FiCheck className="h-4 w-4" />
                                              <span>Agregado</span>
                                            </>
                                          ) : (
                                            <>
                                              <FiPlus className="h-4 w-4" />
                                              <span>Agregar</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel de Carrito */}
                <div className="lg:col-span-1">
                  <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header del carrito */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiShoppingCart className="h-5 w-5 text-white" />
                          <h4 className="font-bold text-white">Carrito</h4>
                        </div>
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-lg text-white text-sm font-bold rounded-lg">
                          {carrito.length}
                        </span>
                      </div>
                    </div>

                    {/* Items del carrito */}
                    <div className="p-4 max-h-[450px] overflow-y-auto space-y-3">
                      {carrito.length === 0 ? (
                        <div className="text-center py-8">
                          <FiShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">El carrito está vacío</p>
                        </div>
                      ) : (
                        carrito.map(item => (
                          <div key={item.idVariante} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            {/* Header del item */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {item.producto.nombreProducto}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.color?.nombreColor || 'N/A'} - {item.talla?.nombreTalla || 'N/A'}
                                </p>
                              </div>
                              <button
                                onClick={() => eliminarDelCarrito(item.idVariante)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Cantidad */}
                            <div className="mb-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Cantidad</label>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => actualizarCantidad(item.idVariante, item.cantidad - 1)}
                                  disabled={item.cantidad <= 1}
                                  className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <FiMinus className="h-3 w-3" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.cantidad}
                                  onChange={(e) => actualizarCantidad(item.idVariante, e.target.value)}
                                  className="w-16 px-2 py-1.5 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                  onClick={() => actualizarCantidad(item.idVariante, item.cantidad + 1)}
                                  className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <FiPlus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Precio Unitario */}
                            <div className="mb-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Precio Unitario</label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.precioUnitario}
                                onChange={(e) => actualizarPrecio(item.idVariante, e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                              />
                            </div>

                            {/* Descuento */}
                            <div className="mb-2">
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Descuento</label>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={item.descuento.tipo}
                                  onChange={(e) => actualizarDescuento(item.idVariante, 'tipo', e.target.value)}
                                  className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                >
                                  <option value="porcentaje">%</option>
                                  <option value="valor_fijo">$</option>
                                </select>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={item.descuento.valor}
                                  onChange={(e) => actualizarDescuento(item.idVariante, 'valor', e.target.value)}
                                  placeholder="0"
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                              </div>
                              {item.descuento.montoDescuento > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Ahorro: ${formatearPrecioColombia(item.descuento.montoDescuento)}
                                </p>
                              )}
                            </div>

                            {/* Subtotal */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Subtotal:</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  ${formatearPrecioColombia((item.cantidad * item.precioUnitario) - (item.descuento.montoDescuento || 0))}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Totales */}
                    {carrito.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">${formatearPrecioColombia(totales.subtotal)}</span>
                        </div>
                        {totales.descuentoTotal > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">-${formatearPrecioColombia(totales.descuentoTotal)}</span>
                          </div>
                        )}
                        {/* Campo de Impuestos */}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Impuestos (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={impuestos}
                            onChange={(e) => setImpuestos(parseFloat(e.target.value) || 0)}
                            placeholder="Ej: 19"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                          />
                          {totales.montoImpuestos > 0 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Impuestos ({impuestos}%): ${formatearPrecioColombia(totales.montoImpuestos)}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">${formatearPrecioColombia(totales.total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: Confirmación */}
            {paso === 3 && (
              <div className="space-y-6">
                {/* Info de la compra */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <FiUser className="h-5 w-5 text-indigo-600" />
                    <span>Información de la Compra</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proveedor</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{proveedorSeleccionado?.nombreProveedor}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">NIT: {proveedorSeleccionado?.nitCC}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Factura / O.C #</label>
                      <input
                        type="text"
                        value={numeroCompraManual}
                        onChange={(e) => setNumeroCompraManual(e.target.value)}
                        placeholder="FAC-000"
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Fecha de Compra</label>
                      <input
                        type="date"
                        value={fechaCompra}
                        onChange={(e) => setFechaCompra(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Fecha Estimada de Entrega</label>
                      <input
                        type="date"
                        value={fechaEntrega}
                        onChange={(e) => setFechaEntrega(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Notas / Observaciones</label>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Escribe aquí cualquier observación sobre esta compra..."
                      rows="2"
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                </div>

                {/* Detalle de productos */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <FiPackage className="h-5 w-5 text-indigo-600" />
                    <span>Detalle de Productos</span>
                  </h4>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Producto</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Variante</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cant.</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Precio</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Desc.</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {carrito.map(item => (
                            <tr key={item.idVariante} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {item.imagenVariante ? (
                                      <img src={item.imagenVariante} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <FiPackage className="h-5 w-5 text-gray-500" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.producto.nombreProducto}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {item.color?.nombreColor || 'N/A'} - {item.talla?.nombreTalla || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{item.cantidad}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">${formatearPrecioColombia(item.precioUnitario)}</td>
                              <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                                {item.descuento.montoDescuento > 0 ? `-$${formatearPrecioColombia(item.descuento.montoDescuento)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-white">
                                ${formatearPrecioColombia((item.cantidad * item.precioUnitario) - (item.descuento.montoDescuento || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Resumen de totales */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${formatearPrecioColombia(totales.subtotal)}</span>
                    </div>
                    {totales.descuentoTotal > 0 && (
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 dark:text-gray-400">Descuento Total:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">-${formatearPrecioColombia(totales.descuentoTotal)}</span>
                      </div>
                    )}
                    {totales.montoImpuestos > 0 && (
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 dark:text-gray-400">Impuestos ({impuestos}%):</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">${formatearPrecioColombia(totales.montoImpuestos)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Total:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          ${formatearPrecioColombia(totales.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={paso === 1 ? onClose : pasoAnterior}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiChevronLeft className="h-4 w-4" />
              <span>{paso === 1 ? 'Cancelar' : 'Anterior'}</span>
            </button>

            <div className="flex space-x-3">
              {paso < 3 ? (
                <button
                  onClick={siguientePaso}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Siguiente</span>
                  <FiChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={confirmarCompra}
                  disabled={procesando}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2 disabled:cursor-not-allowed"
                >
                  <FiCheck className="h-5 w-5" />
                  <span>{procesando ? 'Procesando...' : 'Confirmar Compra'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCompra;
