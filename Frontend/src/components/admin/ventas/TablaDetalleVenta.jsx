import React from 'react';
import { 
  FiTrash2, FiPlus, FiMinus, FiTag, FiAlertCircle, 
  FiPackage, FiDollarSign, FiPercent 
} from 'react-icons/fi';

const TablaDetalleVenta = ({ carrito, onActualizarCantidad, onActualizarDescuento, onEliminar }) => {
  const UPLOAD_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    });
  };

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">
        <div className="h-20 w-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <FiPackage className="h-10 w-10 text-gray-200" />
        </div>
        <h4 className="text-gray-800 dark:text-gray-200 font-bold">Carrito Vacío</h4>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Agrega productos en el paso anterior</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] px-4">
          <tr>
            <th className="pb-2 pl-6">Detalle de Producto</th>
            <th className="pb-2 text-center">Cantidad</th>
            <th className="pb-2 text-right">Precio Unit.</th>
            <th className="pb-2 text-right">Ajuste / Desc.</th>
            <th className="pb-2 text-right">Subtotal</th>
            <th className="pb-2 pr-6 text-center"></th>
          </tr>
        </thead>
<tbody className="space-y-4">
  {carrito.map((item, index) => {
    const subtotal = item.cantidad * item.precioUnitario;
    const totalLinea = subtotal - (Number(item.descuentoLinea) || 0);
    const esStockBajo = item.cantidad >= item.stockActual - 2;

    return (
      <tr
        key={`${item.idVariante}-${index}`}
        className="bg-white dark:bg-gray-800/50 shadow-sm rounded-[1.8rem] group hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 ring-1 ring-gray-100 dark:ring-gray-700/50 hover:ring-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5"
      >
        <td className="py-4 pl-6 rounded-l-[1.8rem]">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 flex-shrink-0 shadow-inner border border-gray-100 dark:border-gray-700 relative group-hover:scale-105 transition-transform duration-500">
              <img
                src={`${UPLOAD_URL}${item.imagenVariante}`}
                alt={item.producto?.titulo}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate max-w-[200px]">
                {item.producto?.titulo}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                  {item.color?.nombreColor}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-500 rounded-lg">
                  {item.talla?.nombreTalla}
                </span>
              </div>
            </div>
          </div>
        </td>

        <td className="py-4 text-center">
          <div className="inline-flex items-center justify-center p-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => onActualizarCantidad(item.idVariante, item.cantidad - 1)}
              className="p-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 hover:shadow-sm transition-all active:scale-95"
            >
              <FiMinus className="h-3 w-3" />
            </button>

            <span className="text-sm font-bold w-10 text-center text-gray-800 dark:text-white">
              {item.cantidad}
            </span>

            <button
              onClick={() => onActualizarCantidad(item.idVariante, item.cantidad + 1)}
              className="p-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 hover:shadow-sm transition-all active:scale-95"
            >
              <FiPlus className="h-3 w-3" />
            </button>
          </div>

          {esStockBajo && (
            <div className="mt-2 flex items-center justify-center gap-1 animate-pulse">
              <FiAlertCircle className="h-2.5 w-2.5 text-amber-500" />
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">
                Stock Crítico ({item.stockActual})
              </span>
            </div>
          )}
        </td>

        <td className="py-4 text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {formatearPrecio(item.precioUnitario)}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Por unidad
            </span>
          </div>
        </td>

        <td className="py-4 text-right">
          <div className="relative inline-block">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <FiTag className="h-3 w-3.5 text-rose-500" />
            </div>
            <input
              type="number"
              value={item.descuentoLinea || 0}
              onChange={(e) =>
                onActualizarDescuento(item.idVariante, e.target.value)
              }
              className="w-24 bg-rose-50/50 dark:bg-rose-900/10 border-2 border-transparent focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl py-2 pl-8 pr-3 text-xs font-bold text-rose-600 dark:text-rose-400 text-right transition-all"
            />
          </div>
        </td>

        <td className="py-4 text-right">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {formatearPrecio(totalLinea)}
            </span>
            {Number(item.descuentoLinea) > 0 && (
              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md mt-1">
                -{formatearPrecio(item.descuentoLinea)}
              </span>
            )}
          </div>
        </td>

        <td className="py-4 pr-6 text-center rounded-r-[1.8rem]">
          <button
            onClick={() => onEliminar(item.idVariante)}
            className="h-10 w-10 flex items-center justify-center text-gray-300 hover:text-rose-500 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-xl transition-all duration-300"
          >
            <FiTrash2 className="h-4.5 w-4.5" />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

      </table>

      {/* Resumen flotante estilo premium */}
      <div className="mt-8 flex justify-end">
         <div className="bg-gray-50 dark:bg-gray-800/80 p-6 rounded-[2rem] border-2 border-gray-100 dark:border-gray-700/50 min-w-[300px] shadow-sm">
            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Productos ({carrito.reduce((acc, i) => acc + i.cantidad, 0)})</span>
                  <span className="text-gray-800 dark:text-white">
                    {formatearPrecio(carrito.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario), 0))}
                  </span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-rose-500 uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <FiPercent className="h-3 w-3" />
                    <span>Descuentos</span>
                  </div>
                  <span>
                    - {formatearPrecio(carrito.reduce((acc, i) => acc + Number(i.descuentoLinea || 0), 0))}
                  </span>
               </div>
               <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-[0.2em]">Total Final</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">
                      {formatearPrecio(carrito.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario) - Number(i.descuentoLinea || 0), 0))}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Venta Enterprise Edition</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TablaDetalleVenta;
