import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

const WizardStep3 = ({ formData, onUpdateFormData }) => {
  const [ganancia, setGanancia] = useState('');

  const precioCompra = parseFloat(formData.precioCompra) || 0;
  const precioVenta = parseFloat(formData.precioVenta) || 0;

  // Calcular porcentaje de ganancia automáticamente
  useEffect(() => {
    if (precioCompra > 0) {
      const porcentaje = ((precioVenta - precioCompra) / precioCompra) * 100;
      setGanancia(porcentaje.toFixed(2));
      onUpdateFormData({ porcentajeGanancia: porcentaje.toFixed(2) });
    }
  }, [precioCompra, precioVenta]);

  const handlePrecioCompraChange = (e) => {
    onUpdateFormData({ precioCompra: e.target.value });
  };

  const handlePrecioVentaChange = (e) => {
    onUpdateFormData({ precioVenta: e.target.value });
  };

  const margenActual = precioVenta - precioCompra;
  const porcentajeGanancia = precioCompra > 0 ? ganancia : 0;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <div className="text-blue-600 dark:text-blue-400 text-sm">
          ℹ️ Ingresa los precios de compra y venta. El margen se calcula automáticamente.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Precio de Compra */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Precio de Compra *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-medium">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precioCompra}
              onChange={handlePrecioCompraChange}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Precio de Venta */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Precio de Venta *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-medium">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precioVenta}
              onChange={handlePrecioVentaChange}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Resumen de Márgenes */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">
            Costo
          </p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            ${precioCompra.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            Margen
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            ${margenActual.toFixed(2)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {porcentajeGanancia}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">
            Precio Venta
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            ${precioVenta.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Indicador de Margen */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Porcentaje de Ganancia
          </p>
          <span className={`
            px-3 py-1 rounded-full text-sm font-bold
            ${porcentajeGanancia >= 30
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : porcentajeGanancia >= 15
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              : porcentajeGanancia > 0
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }
          `}>
            {porcentajeGanancia}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`
              h-full transition-all duration-300 rounded-full
              ${porcentajeGanancia >= 30
                ? 'bg-green-500'
                : porcentajeGanancia >= 15
                ? 'bg-yellow-500'
                : porcentajeGanancia > 0
                ? 'bg-orange-500'
                : 'bg-red-500'
              }
            `}
            style={{
              width: `${Math.min(Math.max(porcentajeGanancia / 50 * 100, 0), 100)}%`
            }}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>
            {porcentajeGanancia >= 30
              ? '✓ Ganancia excelente'
              : porcentajeGanancia >= 15
              ? '○ Ganancia buena'
              : porcentajeGanancia > 0
              ? '⚠ Ganancia baja'
              : '✗ Sin ganancia'
            }
          </p>
        </div>
      </div>

      {/* Cambio Rápido */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Calculadora Rápida
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[15, 25, 30].map((pct) => (
            <button
              key={pct}
              onClick={() => {
                const nuevoPrecioVenta = precioCompra * (1 + pct / 100);
                onUpdateFormData({ precioVenta: nuevoPrecioVenta.toFixed(2) });
              }}
              disabled={precioCompra === 0}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +{pct}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WizardStep3;
