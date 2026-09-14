import React from 'react';
import { 
  FiX, FiInfo, FiPackage, FiUser, FiCalendar, 
  FiHash, FiFileText, FiTag, FiDollarSign, FiClock 
} from 'react-icons/fi';

const formatearPrecioColombia = (valor) => {
  const numero = Math.round(Number(valor) || 0);
  return numero.toLocaleString('es-CO');
};

const ModalDetalleCompra = ({ isOpen, onClose, compra }) => {
  if (!isOpen || !compra) return null;

  // Helper para obtener la imagen de la variante o del producto
  const getImagenDisplay = (detalle) => {
    return (
      detalle.variante?.imagenesVariantes?.[0]?.rutaImagen || 
      detalle.variante?.producto?.imagenesProductos?.[0]?.rutaImagen ||
      null
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/80 backdrop-blur-md" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-950 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-gray-100 dark:border-gray-800">
          {/* Header con gradiente Premium */}
          <div className="bg-gradient-to-r from-primary via-primary-container to-tertiary px-4 py-4 sm:px-8 sm:py-6 flex justify-between items-center gap-2 text-white">
            <div className="flex items-center gap-3 sm:space-x-5 min-w-0">
              <div className="bg-white/20 p-2 sm:p-3 shrink-0 rounded-2xl backdrop-blur-md border border-white/30">
                <FiPackage className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-2xl font-semibold tracking-tight truncate">Análisis Detallado de Compra</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-white/80 text-xs sm:text-sm font-medium">
                  <span className="flex items-center gap-1"><FiHash className="h-3.5 w-3.5" /> {compra.numeroCompra || `#${compra.idCompra}`}</span>
                  <span className="hidden sm:inline opacity-40">|</span>
                  <span className="hidden sm:flex items-center gap-1"><FiClock className="h-3.5 w-3.5" /> ID Interno: {compra.idCompra}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 p-2 sm:p-2.5 shrink-0 rounded-xl transition-all border border-white/20 group"
            >
              <FiX className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-950 space-y-6 sm:space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Cards de Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Proveedor */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -translate-y-4 translate-x-4" />
                <div className="flex items-center space-x-3 text-primary dark:text-primary mb-4">
                  <FiUser className="h-5 w-5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Socio Estratégico</span>
                </div>
                <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight mb-1">{compra.proveedor?.nombreProveedor}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-tighter">NIT / CC:</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{compra.proveedor?.nitCC}</span>
                </div>
              </div>

              {/* Tiempos */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full -translate-y-4 translate-x-4" />
                <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 mb-4">
                  <FiCalendar className="h-5 w-5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Cronograma de Entrega</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Registro:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{new Date(compra.fechaCompra).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Entrega:</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${compra.fechaEntrega ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                      {compra.fechaEntrega ? new Date(compra.fechaEntrega).toLocaleDateString() : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado y Responsable */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -translate-y-4 translate-x-4" />
                <div className="flex items-center space-x-3 text-primary dark:text-primary mb-4">
                  <FiInfo className="h-5 w-5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Estatus & Registro</span>
                </div>
                <div 
                  className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide border mb-4"
                  style={{ 
                    backgroundColor: `${compra.estadoPedido?.color}15`, 
                    color: compra.estadoPedido?.color,
                    borderColor: `${compra.estadoPedido?.color}30`
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: compra.estadoPedido?.color }} />
                  {compra.estadoPedido?.nombreEstado || 'Pendiente'}
                </div>
                <p className="text-[11px] text-gray-400 font-medium pt-1 uppercase tracking-tighter">Registrado por: <span className="text-gray-700 dark:text-gray-200">{compra.usuarioRegistro?.nombres} {compra.usuarioRegistro?.apellidos}</span></p>
              </div>
            </div>

            {/* Notas con diseño de citación */}
            {compra.notas && (
              <div className="bg-primary-fixed/50 dark:bg-tertiary/10 p-6 rounded-3xl border-l-4 border-primary flex items-start space-x-4">
                <FiFileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">Observaciones Generales</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">"{compra.notas}"</p>
                </div>
              </div>
            )}

            {/* Tabla de Productos Rediseñada */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl shadow-gray-200/20">
              <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                  <FiTag className="text-primary" /> Detalle de Ítems Adquiridos
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead className="bg-white dark:bg-gray-900 text-left">
                    <tr>
                      <th className="px-8 py-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Variante</th>
                      <th className="px-6 py-5 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Uds.</th>
                      <th className="px-6 py-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Unidad</th>
                      <th className="px-6 py-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Bonif. / Descto</th>
                      <th className="px-8 py-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Subtotal Bruto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {compra.detalleCompras?.map((detalle) => {
                      const img = getImagenDisplay(detalle);
                      return (
                        <tr key={detalle.idDetalleCompra} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-5">
                              <div className="relative h-14 w-14 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
                                {img ? (
                                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <FiPackage className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                  {detalle.variante?.producto?.nombreProducto}
                                </p>
                                <div className="flex items-center gap-3">
                                  {/* Círculo de Color Gráfico */}
                                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {detalle.variante?.color?.codigoHex && (
                                      <div 
                                        className="h-3 w-3 rounded-full shadow-sm ring-1 ring-white/50" 
                                        style={{ backgroundColor: detalle.variante.color.codigoHex }}
                                      />
                                    )}
                                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                      {detalle.variante?.color?.nombreColor || 'N/A'}
                                    </span>
                                  </div>
                                  <span className="px-2 py-1 bg-primary-fixed dark:bg-tertiary/30 text-primary dark:text-primary text-[11px] font-semibold rounded-lg uppercase tracking-tighter ring-1 ring-primary/20">
                                    Talla-{detalle.variante?.talla?.nombreTalla || 'U'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="text-sm font-extrabold text-gray-900 dark:text-gray-200">
                              {Number(detalle.cantidad)}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              ${formatearPrecioColombia(detalle.precioUnitario)}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <span className={`text-xs font-semibold ${Number(detalle.descuentoLinea) > 0 ? 'text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg' : 'text-gray-400'}`}>
                              {Number(detalle.descuentoLinea) > 0 ? `-$${formatearPrecioColombia(detalle.descuentoLinea)}` : '$0'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-sm font-semibold text-primary dark:text-primary tracking-tight">
                              ${formatearPrecioColombia(detalle.totalLinea)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen Financiero Estilizado */}
            <div className="flex justify-end pt-4">
              <div className="w-full md:w-80 bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl shadow-primary/10 border border-gray-100 dark:border-gray-800 space-y-5">
                <h5 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] text-center mb-6">Conciliación Financiera</h5>
                
                <div className="flex justify-between items-center text-sm group">
                  <span className="text-gray-500 font-medium">Subtotal Acumulado</span>
                  <span className="font-semibold text-gray-900 dark:text-white transition-transform group-hover:scale-110">${formatearPrecioColombia(compra.subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm group">
                  <span className="text-gray-500 font-medium">Bonificaciones Aplicadas</span>
                  <span className="font-semibold text-red-500 group-hover:scale-110">-${formatearPrecioColombia(compra.descuento)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm group">
                  <span className="text-gray-500 font-medium">Impuestos Directos</span>
                  <span className="font-semibold text-primary group-hover:scale-110">${formatearPrecioColombia(compra.impuestos)}</span>
                </div>
                
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Inversión Total</span>
                    <FiDollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-4xl font-semibold text-primary dark:text-primary tracking-tighter text-right">
                    ${formatearPrecioColombia(compra.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 sm:px-8 sm:py-5 flex justify-between items-center gap-3">
            <p className="hidden sm:block text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.1em]">© Adi Estilos 2026 - Módulo de Auditoría</p>
            <button
               onClick={onClose}
               className="w-full sm:w-auto px-6 py-3 sm:px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-xs uppercase tracking-wide rounded-2xl hover:scale-105 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
             >
               Finalizar Revisión
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCompra;
