import React from 'react';
import { FiDollarSign, FiPercent, FiTag, FiShoppingBag } from 'react-icons/fi';

const ResumenVenta = ({ subtotal, descuentoTotal, impuestos, total }) => {
  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide mb-6 flex items-center gap-2">
        <FiShoppingBag className="h-4 w-4" />
        Resumen Financiero
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center group">
          <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Subtotal Bruto</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{formatearPrecio(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center group">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500">
              <FiTag className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Descuentos Aplicados</span>
          </div>
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">-{formatearPrecio(descuentoTotal)}</span>
        </div>

        <div className="flex justify-between items-center group">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
              <FiPercent className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Impuestos Sugeridos</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">+{formatearPrecio(impuestos)}</span>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Total a Pagar</span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 tracking-tighter">
                {formatearPrecio(total)}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-tighter">Iva Incluido (si aplica)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <FiDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-indigo-100 uppercase tracking-wide">Valor Neto Venta</p>
            <p className="text-lg font-semibold text-white leading-none">{formatearPrecio(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenVenta;
