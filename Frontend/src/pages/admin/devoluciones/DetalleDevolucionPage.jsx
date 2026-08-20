import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiUser, FiPackage, FiFileText, FiClock, FiCheckCircle, 
  FiDollarSign, FiCalendar, FiSearch, FiArrowRight, FiEye, FiEdit, FiTrash2
} from 'react-icons/fi';
import { devolucionesApi } from '../../../api/devolucionesApi';
import DevolucionForm from './DevolucionForm';
import Swal from 'sweetalert2';

/**
 * Página de detalle de devolución con modo dual:
 * 1. Modo Buscador: Muestra lista y búsqueda si no hay ID.
 * 2. Modo Detalle: Muestra información completa de una devolución específica.
 */
const DetalleDevolucionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [devolucion, setDevolucion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  
  // Estados para modo buscador (sin ID)
  const [listaDevoluciones, setListaDevoluciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    if (id) {
      cargarDetalle();
    } else {
      cargarListaDevoluciones();
    }
  }, [id]);

  const cargarDetalle = async () => {
    setCargando(true);
    try {
      const res = await devolucionesApi.getDevolucionById(id);
      setDevolucion(res.datos || res);
    } catch (error) {
      console.error('Error cargando detalle de devolución', error);
      Swal.fire('Error', 'No se pudo cargar la información de la devolución', 'error');
      navigate('/admin/devoluciones/detalle');
    } finally {
      setCargando(false);
    }
  };

  const cargarListaDevoluciones = async () => {
    setCargando(true);
    try {
      const res = await devolucionesApi.getDevoluciones({ limite: 50 });
      const datos = res.datos || [];
      setListaDevoluciones(datos);
      setFiltrados(datos);
    } catch (error) {
      console.error('Error cargando lista de devoluciones', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!id && busqueda) {
      const q = busqueda.toLowerCase();
      const filtered = listaDevoluciones.filter(d => 
        d.usuarioCliente?.nombres?.toLowerCase().includes(q) ||
        d.usuarioCliente?.apellidos?.toLowerCase().includes(q) ||
        d.numeroDevolucion?.toLowerCase().includes(q) ||
        d.venta?.numeroFactura?.toString().includes(q)
      );
      setFiltrados(filtered);
    } else {
      setFiltrados(listaDevoluciones);
    }
  }, [busqueda, listaDevoluciones, id]);

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return null;
    if (typeof imagenPath !== 'string') return null;
    return getImagenURL(imagenPath) || null;
  };

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-950 gap-4">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide animate-pulse">Sincronizando Devolución...</p>
      </div>
    );
  }

  // MODO BUSCADOR (Si no hay ID seleccionado)
  if (!id) {
    return (
      <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
        <div className="max-w-[1200px] mx-auto space-y-12">
           
           {/* Hero Search Section */}
           <div className="text-center space-y-6 py-10">
              <div className="inline-flex p-4 bg-purple-600 text-white rounded-[2rem] shadow-2xl shadow-purple-500/40 mb-4 animate-bounce">
                 <FiSearch className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">Detalle de Devolución</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
                 Busca por número de devolución, factura o cliente para ver el detalle completo, productos devueltos y estado financiero.
              </p>

              <div className="max-w-2xl mx-auto relative group mt-10">
                 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <FiSearch className="h-6 w-6 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                 </div>
                 <input 
                   type="text" 
                   value={busqueda}
                   onChange={(e) => setBusqueda(e.target.value)}
                   placeholder="Buscar por devolución, factura o cliente..."
                   className="w-full pl-16 pr-6 py-6 bg-white dark:bg-gray-900 border-none rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-4 focus:ring-purple-500/20 text-lg font-semibold transition-all"
                 />
                 <div className="absolute inset-y-0 right-0 p-2">
                    <div className="h-full px-6 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                       Filtro rápido
                    </div>
                 </div>
              </div>
           </div>

           {/* Results Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map((item) => (
                 <div 
                    key={item.idDevolucion}
                    onClick={() => navigate(`/admin/devoluciones/detalle/${item.idDevolucion}`)}
                    className="group bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 hover:scale-[1.02] hover:border-purple-300 dark:hover:border-purple-900 transition-all cursor-pointer relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-bl-[60px] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                       <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-4">{item.numeroDevolucion}</span>
                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                          {item.usuarioCliente?.nombres} <br/>
                          <span className="opacity-50">{item.usuarioCliente?.apellidos}</span>
                       </h3>
                       
                       <div className="mt-8 space-y-2 flex-1">
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-semibold text-gray-400 uppercase">Factura</span>
                             <span className="font-semibold text-gray-700 dark:text-gray-300">{item.venta?.numeroFactura}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-semibold text-gray-400 uppercase">Total Devolución</span>
                             <span className="font-semibold text-purple-600 text-lg">{formatearMoneda(item.totalDevolucion)}</span>
                          </div>
                       </div>

                       <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <span className={`px-3 py-1 rounded-xl text-[11px] font-semibold uppercase tracking-wider ${
                             item.estado === 'procesada' ? 'bg-emerald-50 text-emerald-600' : 
                             item.estado === 'pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                          }`}>
                             {item.estado}
                          </span>
                          <FiArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                 </div>
              ))}
              
              {filtrados.length === 0 && (
                 <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-semibold uppercase tracking-wide text-sm">No se encontraron devoluciones</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // MODO DETALLE (Si hay ID)
  if (id && !devolucion) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-950 gap-4">
        <p className="text-gray-500 font-semibold uppercase tracking-wide">No se pudo encontrar el expediente</p>
        <button 
          onClick={() => navigate('/admin/devoluciones/detalle')}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
        >
          Volver al buscador
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/admin/devoluciones/detalle')}
                className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:scale-105 transition-all text-gray-500 hover:text-purple-600"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Expediente de Devolución</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide border ${
                      devolucion.estado === 'procesada'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900'
                      : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900'
                    }`}>
                      {devolucion.estado}
                    </span>
                 </div>
                 <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">{devolucion.numeroDevolucion}</h1>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => setMostrarModalEdicion(true)}
                disabled={devolucion.estado === 'procesada'}
                className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold uppercase text-xs tracking-wide rounded-[2rem] shadow-sm border border-gray-200 dark:border-gray-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <FiEdit className="h-4 w-4" /> Editar
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           
           {/* Columna Principal: Info y Productos */}
           <div className="xl:col-span-2 space-y-8">
              
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Cliente */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-2 relative z-10">
                       <FiUser className="text-purple-500" /> Solicitante
                    </h3>
                    <div className="relative z-10">
                       <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-tight">{devolucion.usuarioCliente?.nombres} {devolucion.usuarioCliente?.apellidos}</p>
                       <p className="text-xs text-purple-500 font-semibold mb-8">{devolucion.usuarioCliente?.correoElectronico || 'Sin correo'}</p>
                       
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fecha Trámite</p>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{new Date(devolucion.fechaDevolucion).toLocaleDateString()}</p>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Venta Relacionada */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-2 relative z-10">
                       <FiFileText className="text-emerald-500" /> Documento de Venta
                    </h3>
                    <div className="relative z-10">
                       <p className="text-2xl font-semibold text-gray-900 dark:text-white">#{devolucion.venta?.numeroFactura}</p>
                       <span className={`inline-block px-3 py-1 rounded-xl text-[11px] font-semibold uppercase tracking-wider mb-8 ${
                          devolucion.tipoDevolucion === 'total' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                       }`}>
                          Devolución {devolucion.tipoDevolucion}
                       </span>
                       
                       <button
                          onClick={() => navigate(`/admin/ventas/detalle/${devolucion.idVenta}`)}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-gray-800 text-white font-semibold text-[11px] uppercase tracking-wide rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                       >
                          <FiEye className="h-4 w-4" /> Ver Venta Original
                       </button>
                    </div>
                 </div>
              </div>

              {/* Motivo y Observaciones */}
              <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-6">Justificación de la Devolución</h3>
                  <div className="space-y-6">
                    <div>
                      <span className="text-[11px] font-semibold text-purple-500 uppercase tracking-wide block mb-2">Motivo Principal</span>
                      <p className="text-gray-700 dark:text-gray-300 font-medium bg-purple-50 dark:bg-purple-900/10 p-5 rounded-3xl border border-purple-100 dark:border-purple-800/30">
                        {devolucion.motivo}
                      </p>
                    </div>
                    {devolucion.observaciones && (
                      <div>
                        <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wide block mb-2">Observaciones Internas</span>
                        <p className="text-gray-700 dark:text-gray-300 font-medium bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-800/30">
                          {devolucion.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
              </div>

              {/* Detalle de Productos */}
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                       <FiPackage className="text-purple-500" /> Items Devueltos
                    </h3>
                 </div>
                 
                  <div className="p-8 space-y-4">
                      {devolucion.detalleDevoluciones?.map((item, idx) => {
                         const imgUrl = getImagenUrl(
                            item.variante?.imagenesVariantes?.[0]?.rutaImagen || 
                            item.variante?.producto?.imagenes?.[0]?.rutaImagen
                         );

                         return (
                            <div key={idx} className="flex gap-6 p-5 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-100 dark:hover:border-purple-900/40 transition-all items-center group">
                                <div className="h-24 w-24 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner group-hover:scale-105 transition-transform">
                                   {imgUrl ? (
                                      <img src={imgUrl} alt={item.variante?.producto?.nombreProducto} className="w-full h-full object-cover" />
                                   ) : (
                                      <FiPackage className="h-10 w-10 text-gray-300" />
                                   )}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[11px] font-semibold text-purple-500 uppercase tracking-wide">{item.variante?.codigoSku}</span>
                                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Cant: {item.cantidadDevuelta}</span>
                                   </div>
                                   <p className="font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate uppercase tracking-tight">
                                      {item.variante?.producto?.nombreProducto}
                                   </p>
                                   <div className="flex gap-2 mt-3">
                                      <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded-xl text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2 border border-gray-200 dark:border-gray-600">
                                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.variante?.color?.codigoHex || '#ccc' }} />
                                         {item.variante?.color?.nombreColor}
                                      </span>
                                      <span className="text-[11px] font-semibold bg-purple-50 dark:bg-purple-900/20 px-4 py-1.5 rounded-xl text-purple-600 dark:text-purple-400 uppercase tracking-wide border border-purple-100 dark:border-purple-900/30">
                                         Talla: {item.variante?.talla?.nombreTalla}
                                      </span>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1 tracking-wide">Subtotal</p>
                                   <p className="text-xl font-semibold text-gray-900 dark:text-white tracking-tighter">{formatearMoneda(item.subtotal)}</p>
                                </div>
                            </div>
                         );
                      })}
                  </div>
              </div>
           </div>

           {/* Columna Lateral: Resumen Financiero */}
           <div className="space-y-8">
              <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-2xl shadow-purple-500/10 dark:shadow-none border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
                  
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-4">Monto Total Devuelto</p>
                  <p className="text-5xl font-semibold text-gray-900 dark:text-white mb-10 tracking-tighter">{formatearMoneda(devolucion.totalDevolucion)}</p>
                  
                  <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-8">
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-400 uppercase tracking-wide">Subtotal</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{formatearMoneda(devolucion.subtotalDevolucion)}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-400 uppercase tracking-wide">Impuestos</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{formatearMoneda(devolucion.impuestosDevolucion || 0)}</span>
                     </div>
                  </div>

                  {devolucion.estado === 'procesada' && (
                    <div className="mt-10 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center gap-3">
                        <FiCheckCircle className="text-emerald-500 h-6 w-6" />
                        <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Inventario Sincronizado</span>
                    </div>
                  )}
              </div>

              {/* Auditoría */}
              <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-white uppercase tracking-[0.1em] mb-8 flex items-center gap-3">
                     <FiClock className="text-purple-500" /> Trazabilidad
                  </h3>
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                           <FiCalendar />
                        </div>
                        <div>
                           <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">Registrado el</p>
                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatearFecha(devolucion.creadoEn)}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                           <FiUser />
                        </div>
                        <div>
                           <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">Registrado por</p>
                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{devolucion.usuarioRegistroRef?.nombres || 'Sistema'}</p>
                        </div>
                     </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {mostrarModalEdicion && (
        <DevolucionForm
          devolucion={devolucion}
          accion="editar"
          onClose={() => setMostrarModalEdicion(false)}
          onSuccess={() => {
            setMostrarModalEdicion(false);
            cargarDetalle();
            Swal.fire('Éxito', 'Devolución actualizada correctamente', 'success');
          }}
        />
      )}
    </div>
  );
};

export default DetalleDevolucionPage;

