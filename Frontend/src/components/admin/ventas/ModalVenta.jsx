import React, { useState, useEffect } from 'react';
import { 
  FiX, FiChevronRight, FiChevronLeft, FiCheck, FiShoppingCart, 
  FiUser, FiShoppingBag, FiTruck, FiCreditCard, FiFileText 
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import SelectorCliente from './SelectorCliente';
import SelectorVariantes from './SelectorVariantes';
import TablaDetalleVenta from './TablaDetalleVenta';
import ResumenVenta from './ResumenVenta';
import { ventasApi } from '../../../api/ventasApi';
import { metodosPagoApi } from '../../../api/metodosPagoApi';
import { estadosPedidoApi } from '../../../api/estadosPedidoApi';
import { descuentosApi } from '../../../api/descuentosApi';
import { FiPercent, FiHash, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';

const ModalVenta = ({ isOpen, onClose, onVentaCreada }) => {
  const { usuario } = useAuth();
  const [paso, setPaso] = useState(1);
  const [cliente, setCliente] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [estadosPedido, setEstadosPedido] = useState([]);
  
  // Datos de factura
  const [idMetodoPago, setIdMetodoPago] = useState('');
  const [pagosMultimetodo, setPagosMultimetodo] = useState({});
  const [idEstadoPedido, setIdEstadoPedido] = useState('');
  const [tipoVenta, setTipoVenta] = useState('contado');
  const [notas, setNotas] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Impuestos y Descuentos
  const [aplicaIva, setAplicaIva] = useState(false);
  const [porcentajeIva, setPorcentajeIva] = useState(19);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [infoCupon, setInfoCupon] = useState(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDataInicial();
    } else {
      resetModal();
    }
  }, [isOpen]);

  const cargarDataInicial = async () => {
    try {
      const [resMetodos, resEstados] = await Promise.all([
        metodosPagoApi.getMetodosPago(),
        estadosPedidoApi.getEstadosPedido()
      ]);
      setMetodosPago(resMetodos.datos || resMetodos || []);
      setEstadosPedido(resEstados.datos || resEstados || []);
      
      // Defaults
      if (resEstados.datos?.[0]) setIdEstadoPedido(resEstados.datos[0].idEstadoPedido);
      if (resMetodos.datos?.[0]) setIdMetodoPago(resMetodos.datos[0].idMetodoPago);
    } catch (error) {
      console.error("Error cargando data inicial", error);
    }
  };

  const resetModal = () => {
    setPaso(1);
    setCliente(null);
    setCarrito([]);
    setNotas('');
    setDireccionEntrega('');
    setTipoVenta('contado');
    setPagosMultimetodo({ efectivo: 0, tarjeta: 0, credito: 0, referenciaTarjeta: '' });
    setAplicaIva(false);
    setCodigoCupon('');
    setInfoCupon(null);
  };

  const agregarAlCarrito = (variante, producto) => {
    // Corregir mapeo: galería usa 'id', ventas usa 'idVariante'
    const idVarianteReal = variante.idVariante || variante.id;
    const existe = carrito.find(item => item.idVariante === idVarianteReal);

    if (existe) {
      actualizarCantidad(idVarianteReal, existe.cantidad + 1);
      return;
    }

    const nuevoItem = {
      idVariante: idVarianteReal,
      producto,
      color: variante.color,
      talla: variante.talla,
      cantidad: 1,
      precioUnitario: variante.precioVenta,
      stockActual: variante.cantidadStock,
      imagenVariante: variante.imagenesVariantes?.[0]?.rutaImagen || producto.imagen,
      descuentoLinea: 0
    };

    setCarrito([...carrito, nuevoItem]);
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: 'Producto agregado al carrito',
      timer: 800,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const actualizarCantidad = (id, cant) => {
    const item = carrito.find(i => i.idVariante === id);
    if (!item) return;
    
    const nuevaCant = Math.max(1, Math.min(cant, item.stockActual));
    setCarrito(carrito.map(i => i.idVariante === id ? { ...i, cantidad: nuevaCant } : i));
  };

  const actualizarDescuento = (id, desc) => {
    setCarrito(carrito.map(i => i.idVariante === id ? { ...i, descuentoLinea: Number(desc) || 0 } : i));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(i => i.idVariante !== id));
  };

  const aplicarCupon = async () => {
    if (!codigoCupon) return;
    setValidandoCupon(true);
    try {
      const res = await descuentosApi.validarDescuento(codigoCupon, subtotalProductos - totalDescuentosLinea);
      const descuentoEncontrado = res.descuento || res.datos?.descuento || (res.valido ? res : null);
      
      if (!descuentoEncontrado) throw new Error("No se encontró información del descuento");

      setInfoCupon(descuentoEncontrado);
      Swal.fire({
        icon: 'success',
        title: 'Cupón Aplicado',
        text: `Se ha aplicado el descuento: ${descuentoEncontrado.nombreDescuento || 'Promocional'}`,
        timer: 1500,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error validando cupón", error);
      const msgError = error.response?.data?.msg || error.response?.data?.mensaje || 'Código de cupón inválido o expirado';
      Swal.fire('Error', msgError, 'error');
      setInfoCupon(null);
    } finally {
      setValidandoCupon(false);
    }
  };

  // Cálculos
  // Cálculos detallados
  const subtotalProductos = carrito.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario), 0);
  const totalDescuentosLinea = carrito.reduce((acc, i) => acc + (Number(i.descuentoLinea) || 0), 0);
  const baseAntesDeCupon = subtotalProductos - totalDescuentosLinea;
  
  let valorDescuentoGlobal = 0;
  if (infoCupon) {
    const valorDesc = Number(infoCupon.valorDescuento) || 0;
    if (infoCupon.tipoDescuento === 'porcentaje') {
      valorDescuentoGlobal = baseAntesDeCupon * (valorDesc / 100);
    } else {
      valorDescuentoGlobal = valorDesc;
    }
  }

  const baseImponible = baseAntesDeCupon - valorDescuentoGlobal;
  const impuestosTotal = aplicaIva ? (baseImponible * (porcentajeIva / 100)) : 0;
  const totalFinal = baseImponible + impuestosTotal;

  // Calculos de pagos (Abonado vs Crédito)
  const totalAsignado = Object.entries(pagosMultimetodo)
     .filter(([key]) => !key.includes('referencia'))
     .reduce((acc, [_, val]) => acc + (Number(val) || 0), 0);

  const montoCredito = Object.entries(pagosMultimetodo)
    .filter(([key]) => !key.includes('referencia'))
    .reduce((acc, [key, val]) => {
       const metodo = metodosPago.find(m => m.idMetodoPago.toString() === key);
       if (metodo && metodo.nombreMetodo.toLowerCase().includes('crédito')) {
         return acc + (Number(val) || 0);
       }
       return acc;
    }, 0);

  const montoAbonado = totalAsignado - montoCredito;

  const handleSiguiente = () => {
    if (paso === 1 && !cliente) return Swal.fire('Error', 'Debes seleccionar un cliente', 'error');
    if (paso === 2 && carrito.length === 0) return Swal.fire('Error', 'El carrito está vacío', 'error');
    if (paso < 5) setPaso(paso + 1);
  };

  const UPLOAD_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleCrearVenta = async () => {
    // Validar que no haya faltante si se va a finalizar
    const diferencia = totalFinal - totalAsignado;

    if (diferencia > 100) { // Margen de 100 pesos
      return Swal.fire({
        title: 'Venta Incompleta',
        text: `Aún falta cubrir ${formatearPrecio(diferencia)}. Por favor diligencia los montos de pago.`,
        icon: 'warning'
      });
    }

    setProcesando(true);
    try {
      const payload = {
        idUsuario: cliente.idUsuario,
        idUsuarioVendedor: usuario?.idUsuario || null,
        detalleVentas: carrito.map(i => ({
          idVariante: i.idVariante,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuentoLinea: i.descuentoLinea
        })),
        pagos: Object.entries(pagosMultimetodo)
                .filter(([_, monto]) => Number(monto) > 0)
                .map(([idMetodo, monto]) => {
                  const esReferencia = idMetodo.includes('referencia_');
                  if (esReferencia) return null; // Saltar referencias, se procesan con el monto
                  
                  const metodo = metodosPago.find(m => m.idMetodoPago.toString() === idMetodo);
                  const referencia = pagosMultimetodo[`referencia_${idMetodo}`] || null;
                  
                  return {
                    idMetodoPago: parseInt(idMetodo),
                    monto: Number(monto),
                    referencia
                  };
                }).filter(Boolean),
        tipoVenta: montoCredito > 0 ? 'credito' : 'contado',
        idEstadoPedido: parseInt(idEstadoPedido),
        notas,
        direccionEntrega,
        impuestos: impuestosTotal,
        descuentoTotal: totalDescuentosLinea + valorDescuentoGlobal,
        idDescuento: infoCupon?.idDescuento || null,
        codigoDescuentoUsado: infoCupon ? codigoCupon : null
      };

      await ventasApi.createVenta(payload);
      Swal.fire('¡Éxito!', 'Venta registrada correctamente', 'success');
      onVentaCreada();
      onClose();
    } catch (error) {
      console.error("Error creando venta", error);
      Swal.fire('Error', error.mensaje || 'Error al procesar la venta', 'error');
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-[95vw] h-[95vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
              <FiShoppingCart className="h-7 w-7" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Nueva Venta Enterprise</h2>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paso {paso} de 5: {
                  paso === 1 ? 'Cliente' : paso === 2 ? 'Catálogo' : paso === 3 ? 'Detalle' : paso === 4 ? 'Logística' : 'Confirmación'
                }</p>
              </div>

              {/* Badges de estado persistentes */}
              <div className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700">
                {cliente && (
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 py-1.5 px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 transition-all">
                    <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-tighter leading-none">Cliente</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{cliente.nombres} {cliente.apellidos}</span>
                    </div>
                  </div>
                )}
                {carrito.length > 0 && (
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 py-1.5 px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 transition-all delay-100">
                    <div className="h-7 w-7 rounded-full bg-orange-50 dark:bg-orange-900/40 flex items-center justify-center text-orange-600">
                      <FiShoppingBag className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-tighter leading-none">Items</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{carrito.reduce((acc, i) => acc + i.cantidad, 0)} Prod.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FiX className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full h-1.5 bg-gray-100 dark:bg-gray-800">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-500 ${i <= paso ? 'bg-indigo-600' : ''}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {paso === 1 && <SelectorCliente seleccionado={cliente} alSeleccionar={setCliente} />}
            {paso === 2 && <SelectorVariantes alAgregar={agregarAlCarrito} />}
            {paso === 3 && (
              <TablaDetalleVenta 
                carrito={carrito} 
                onActualizarCantidad={actualizarCantidad}
                onActualizarDescuento={actualizarDescuento}
                onEliminar={eliminarDelCarrito}
              />
            )}
            {paso === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Resumen Superior Financiero */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
                    <p className="text-[11px] font-semibold uppercase opacity-70 mb-1">Total Venta</p>
                    <p className="text-2xl font-semibold">{formatearPrecio(totalFinal)}</p>
                  </div>
                  <div className="bg-emerald-500 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20">
                    <p className="text-[11px] font-semibold uppercase opacity-70 mb-1">Abonado</p>
                    <p className="text-2xl font-semibold">{formatearPrecio(montoAbonado)}</p>
                  </div>
                  <div className="bg-rose-500 p-6 rounded-[2rem] text-white shadow-xl shadow-rose-500/20">
                    <p className="text-[11px] font-semibold uppercase opacity-70 mb-1">A Crédito</p>
                    <p className="text-2xl font-semibold">{formatearPrecio(montoCredito)}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-[11px] font-semibold uppercase text-gray-400 mb-1">Faltante / Cambio</p>
                    <p className={`text-2xl font-semibold ${totalFinal - totalAsignado > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {formatearPrecio(Math.abs(totalFinal - totalAsignado))}
                    </p>
                  </div>
                </div>

                {/* Sección de Pagos Multimetodo */}
                <div className="bg-white dark:bg-gray-800/50 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600">
                         <FiCreditCard className="h-6 w-6" />
                      </div>
                      <div>
                         <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-tight">Desglose de Pagos</h4>
                         <p className="text-xs text-gray-400 font-semibold uppercase">Define cómo pagará el cliente esta factura</p>
                      </div>
                   </div>


                   {/* Selector de métodos disponibles */}
                   <div className="mb-6 overflow-x-auto pb-4 custom-scrollbar">
                     <div className="flex gap-3">
                       {metodosPago.filter(m => m.activo).map((metodo) => {
                          const estaSeleccionado = pagosMultimetodo[metodo.idMetodoPago] !== undefined && pagosMultimetodo[metodo.idMetodoPago] !== 0;
                          
                          return (
                            <button
                              key={metodo.idMetodoPago}
                              onClick={() => {
                                // Logic for mixed methods (e.g. "Efectivo + Crédito")
                                if (metodo.nombreMetodo.includes('+')) {
                                   const partes = metodo.nombreMetodo.split('+').map(s => s.trim());
                                   const idsActivados = {};
                                   
                                   partes.forEach(parte => {
                                      // Search for strict match first, then partial
                                      let match = metodosPago.find(m => m.nombreMetodo.toLowerCase() === parte.toLowerCase() && !m.nombreMetodo.includes('+'));
                                      
                                      // Mapping for common aliases
                                      if (!match) {
                                        if (parte.toLowerCase().includes('crédito')) match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('crédito tienda'));
                                        if (parte.toLowerCase() === 'tarjeta') match = metodosPago.find(m => m.nombreMetodo.toLowerCase().includes('tarjeta crédito'));
                                      }

                                      if (match) {
                                        idsActivados[match.idMetodoPago] = 0;
                                      }
                                   });

                                   if (Object.keys(idsActivados).length > 0) {
                                     setPagosMultimetodo(prev => ({ ...prev, ...idsActivados }));
                                     return;
                                   }
                                }

                                // Standard Toggle Logic
                                if (!estaSeleccionado) {
                                  setPagosMultimetodo(prev => ({
                                    ...prev,
                                    [metodo.idMetodoPago]: 0
                                  }));
                                } else {
                                   // If clicking an active single method, we might want to deselect it? 
                                   // For now, let's just focus on activation as per previous logic which didn't toggle off on click (only X button)
                                   // actually, let's allow toggle off for better UX
                                   setPagosMultimetodo(prev => {
                                      const newState = { ...prev };
                                      delete newState[metodo.idMetodoPago];
                                      delete newState[`referencia_${metodo.idMetodoPago}`];
                                      return newState;
                                   });
                                }
                              }}
                              className={`
                                flex-shrink-0 px-4 py-3 rounded-2xl border font-semibold text-xs uppercase tracking-wide transition-all
                                ${estaSeleccionado 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              {metodo.nombreMetodo}
                            </button>
                          );
                       })}
                     </div>
                   </div>

                   {/* Lista de Pagos Activos */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {Object.keys(pagosMultimetodo)
                        .filter(k => !k.includes('referencia'))
                        .map((idKey) => {
                          const metodo = metodosPago.find(m => m.idMetodoPago.toString() === idKey);
                          if (!metodo) return null;

                          const montoActual = pagosMultimetodo[idKey];
                          const requiresRef = metodo.requiereReferencia;

                          return (
                            <div key={idKey} className="group relative space-y-3 bg-gray-50/50 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900">
                               <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate max-w-[120px]" title={metodo.nombreMetodo}>
                                    {metodo.nombreMetodo}
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <button 
                                       onClick={() => {
                                         // Calcular cuánto falta
                                         const totalPagadoOtros = Object.entries(pagosMultimetodo)
                                           .filter(([id]) => id !== idKey && !id.includes('referencia_'))
                                           .reduce((acc, [_, m]) => acc + (Number(m) || 0), 0);
                                         
                                         const restante = Math.max(0, totalFinal - totalPagadoOtros);
                                         
                                         setPagosMultimetodo(prev => ({
                                           ...prev,
                                           [idKey]: restante
                                         }));
                                       }}
                                       className="text-[11px] font-semibold text-indigo-600 uppercase hover:underline whitespace-nowrap bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-lg"
                                    >
                                      Cubrir
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setPagosMultimetodo(prev => {
                                          const newState = { ...prev };
                                          delete newState[idKey];
                                          delete newState[`referencia_${idKey}`];
                                          return newState;
                                        });
                                      }}
                                      className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                                    >
                                      <FiX className="h-3 w-3" />
                                    </button>
                                  </div>
                               </div>

                               <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <span className="text-gray-400 font-semibold">$</span>
                                  </div>
                                  <input 
                                    type="number"
                                    value={montoActual || ''}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value));
                                      setPagosMultimetodo(prev => ({
                                        ...prev,
                                        [idKey]: val
                                      }));
                                    }}
                                    autoFocus
                                    className="w-full bg-white dark:bg-gray-900 border-none rounded-xl py-3 pl-8 pr-4 text-sm font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                                    placeholder="0.00"
                                  />
                               </div>
                               
                               {requiresRef && (
                                 <input 
                                   type="text"
                                   value={pagosMultimetodo[`referencia_${idKey}`] || ''}
                                   onChange={(e) => setPagosMultimetodo(prev => ({
                                     ...prev,
                                     [`referencia_${idKey}`]: e.target.value
                                   }))}
                                   className="w-full bg-white dark:bg-gray-900 border-none rounded-xl py-2 px-3 text-[11px] font-semibold text-gray-500 focus:ring-1 focus:ring-indigo-500 mt-2 shadow-sm animate-in fade-in slide-in-from-top-1"
                                   placeholder={`Ref. ${metodo.nombreMetodo}...`}
                                 />
                               )}
                            </div>
                          );
                      })}
                      
                      {/* Empty State Instructions */}
                      {Object.keys(pagosMultimetodo).filter(k => !k.includes('referencia')).length === 0 && (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                          <p className="text-xs text-gray-400 font-medium">Selecciona un método de pago arriba para comenzar</p>
                        </div>
                      )}
                   </div>
                   
                   {/* Alerta de cuadre dinámico */}
                   {Object.keys(pagosMultimetodo).filter(k => !k.includes('referencia')).length > 0 && (
                     (() => {
                       const totalIngresado = Object.entries(pagosMultimetodo)
                         .filter(([k]) => !k.includes('referencia'))
                         .reduce((acc, [_, v]) => acc + (Number(v) || 0), 0);
                       
                       if (totalIngresado > totalFinal) {
                         return (
                           <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center gap-3">
                              <FiInfo className="h-5 w-5 text-amber-500" />
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-tighter">
                                Atención: El total ingresado ({formatearPrecio(totalIngresado)}) excede el total de la venta en {formatearPrecio(totalIngresado - totalFinal)}.
                              </p>
                           </div>
                         );
                       }
                       return null;
                     })()
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Descuentos y Cupones (Versión Compacta) */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <FiPercent className="h-4 w-4 text-indigo-500" />
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Cupones & IVA</span>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <input 
                          type="text"
                          value={codigoCupon}
                          onChange={(e) => setCodigoCupon(e.target.value)}
                          disabled={infoCupon}
                          className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-xs font-semibold disabled:opacity-50"
                          placeholder="CÓDIGO..."
                        />
                        {!infoCupon ? (
                          <button onClick={aplicarCupon} className="bg-indigo-600 text-white px-4 rounded-xl text-[11px] font-semibold uppercase">Validar</button>
                        ) : (
                          <button onClick={() => setInfoCupon(null)} className="bg-rose-50 text-rose-500 px-4 rounded-xl"><FiX /></button>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                       <span className="text-[11px] font-semibold text-gray-500 uppercase italic">Aplica IVA ({porcentajeIva}%)</span>
                       <button 
                        onClick={() => setAplicaIva(!aplicaIva)}
                        className={`h-5 w-9 rounded-full transition-all relative ${aplicaIva ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                      >
                         <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${aplicaIva ? 'left-4.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <FiTruck className="h-4 w-4 text-indigo-500" />
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Logística & Notas</span>
                    </div>
                    <input 
                      type="text"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-xs font-semibold mb-3"
                      placeholder="Dirección de entrega..."
                    />
                    <textarea 
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      rows={1}
                      className="w-full bg-white dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-xs font-semibold"
                      placeholder="Alguna nota o instrucción especial..."
                    />
                  </div>
                </div>

              </div>
            )}
            {paso === 5 && (
              <div className="flex flex-col items-center justify-center py-4 space-y-6 animate-in zoom-in-95 duration-500 w-full max-w-5xl mx-auto">
                
                <div className="text-center space-y-1 mb-2">
                  <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shadow-xl shadow-green-500/10 mb-4 animate-bounce">
                    <FiCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white tracking-tight">Confirmación Final</h3>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Revisa los detalles antes de procesar</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                   
                   {/* Columna Izquierda: Resumen Venta */}
                   <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-white uppercase mb-4 flex items-center gap-2">
                            <FiUser className="text-indigo-500" /> Datos del Cliente
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[11px] text-gray-400 font-semibold uppercase">Nombre Completo</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cliente?.nombres} {cliente?.apellidos}</p>
                             </div>
                             <div>
                                <p className="text-[11px] text-gray-400 font-semibold uppercase">Identificación</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cliente?.usuario}</p>
                             </div>
                             <div className="col-span-2">
                                <p className="text-[11px] text-gray-400 font-semibold uppercase">Dirección de Entrega</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{direccionEntrega || 'Misma del perfil'}</p>
                             </div>
                          </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-white uppercase mb-4 flex items-center gap-2">
                            <FiCreditCard className="text-indigo-500" /> Detalle de Pagos
                          </h4>
                          
                          <div className="space-y-3">
                             <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-500 font-semibold">Tipo de Transacción</span>
                                <span className="text-xs font-semibold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                                  {montoCredito > 0 && montoAbonado > 0 ? 'Mixto (Crédito + Contado)' : montoCredito > 0 ? 'Crédito' : 'Contado'}
                                </span>
                             </div>

                             {Object.entries(pagosMultimetodo)
                              .filter(([k]) => !k.includes('referencia') && Number(pagosMultimetodo[k]) > 0)
                              .map(([key, valor]) => {
                                const metodo = metodosPago.find(m => m.idMetodoPago.toString() === key);
                                return (
                                  <div key={key} className="flex justify-between items-center">
                                     <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{metodo?.nombreMetodo}</span>
                                     <span className="text-xs font-semibold text-gray-800 dark:text-white">{formatearPrecio(valor)}</span>
                                  </div>
                                );
                              })}
                             
                             <div className="pt-2 mt-2 border-t border-dashed border-gray-200 dark:border-gray-600 flex justify-between items-center text-indigo-600">
                                <span className="text-xs font-semibold uppercase">Total a Pagar</span>
                                <span className="text-lg font-semibold">{formatearPrecio(totalFinal)}</span>
                             </div>
                          </div>
                      </div>
                   </div>

                   {/* Columna Derecha: Productos */}
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full max-h-[400px]">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white uppercase mb-4 flex items-center gap-2">
                        <FiShoppingBag className="text-indigo-500" /> Productos en Orden <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">{carrito.length}</span>
                      </h4>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                         {carrito.map((item, idx) => (
                           <div key={idx} className="flex gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600">
                              <div className="h-16 w-16 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                 <img src={`${UPLOAD_URL}${item.imagenVariante}`} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                 <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{item.producto.titulo}</h5>
                                 <div className="flex flex-col gap-1.5 mt-1.5">
                                    <div className="flex flex-wrap gap-2">
                                      {item.talla && (
                                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-600">
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Talla</span>
                                            <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">{item.talla.nombreTalla}</span>
                                          </div>
                                      )}
                                      {item.color && (
                                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-600">
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Color</span>
                                            <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">{item.color.nombreColor}</span>
                                            <div className="h-2.5 w-2.5 rounded-full border border-gray-200 dark:border-gray-500 ml-1" style={{ backgroundColor: item.color.codigoHex }} />
                                          </div>
                                      )}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col justify-center items-end text-right">
                                 <p className="text-xs font-semibold text-gray-400">x{item.cantidad}</p>
                                 <p className="text-sm font-semibold text-indigo-600">{formatearPrecio(item.precioUnitario)}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Resumen */}
          <div className="w-full md:w-[340px] bg-gray-50/50 dark:bg-gray-800/30 p-8 border-l border-gray-100 dark:border-gray-800">
            <ResumenVenta 
              subtotal={subtotalProductos} 
              descuentoTotal={totalDescuentosLinea + valorDescuentoGlobal} 
              impuestos={impuestosTotal} 
              total={totalFinal} 
            />
            

          {/* Visualización de items resumida */}
          {carrito.length > 0 && (
  <div className="mt-10">
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] mb-4">
      Items Seleccionados
    </p>

    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {carrito.map((item, index) => (
        <div
          key={`${item.idVariante}-${index}`}
          className="flex items-center gap-3 bg-white dark:bg-gray-800/80 p-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          {/* Imagen */}
          <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={`${UPLOAD_URL}${item.imagenVariante}`}
              alt={item.producto?.titulo}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Información */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
              {item.producto?.titulo}
            </p>

            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className="h-2.5 w-2.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm"
                style={{ backgroundColor: item.color?.codigoHex || '#cbd5e1' }}
              />
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">
                Cant: {item.cantidad}
              </p>
            </div>
          </div>

          {/* Precio */}
          <p className="text-xs font-semibold text-indigo-600">
            {formatearPrecio(
              item.cantidad * item.precioUnitario - (item.descuentoLinea || 0)
            )}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
          <button 
            onClick={handleAnterior}
            disabled={paso === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
              paso === 1 ? 'opacity-0 invisible' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <FiChevronLeft /> Anterior
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[11px] font-semibold text-gray-300 uppercase tracking-wide">Enterprise Edition v2026</span>
            {paso < 5 ? (
              <button 
                onClick={handleSiguiente}
                className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                Siguiente <FiChevronRight />
              </button>
            ) : (
              <button 
                onClick={handleCrearVenta}
                disabled={procesando}
                className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {procesando ? 'Procesando...' : 'Confirmar Venta Enterprise'} <FiCheck />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ModalVenta;
