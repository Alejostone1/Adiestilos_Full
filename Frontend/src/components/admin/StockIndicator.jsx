import React from 'react';
import { TrendingDown, AlertTriangle, Package } from 'lucide-react';
import StatusBadge from './StatusBadge';

const StockIndicator = ({
  currentStock,
  minStock,
  maxStock,
  size = 'sm',
  showNumbers = true,
  variant = 'badge',
  className = ''
}) => {
  const getStockStatus = () => {
    // 1. Stock Crítico (Rojo) - Stock actual = 0
    if (currentStock <= 0) {
      return {
        status: 'stock_critico',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-900/50',
        icon: AlertTriangle,
        message: 'Stock crítico'
      };
    }

    // Si no hay límites definidos, usar lógica básica
    if (!minStock || !maxStock) {
      if (currentStock <= (minStock || 0)) {
        return {
          status: 'stock_muy_bajo',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-900/50',
          icon: TrendingDown,
          message: 'Stock muy bajo'
        };
      }
      return {
        status: 'stock_normal',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-900/50',
        icon: Package,
        message: 'Stock normal'
      };
    }

    // Calcular el rango total entre mínimo y máximo
    const rangoTotal = maxStock - minStock;
    const porcentajeDelRango = ((currentStock - minStock) / rangoTotal) * 100;

    // 2. Stock Muy Bajo (Naranja) - Stock actual < Stock mínimo
    if (currentStock < minStock) {
      return {
        status: 'stock_muy_bajo',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-900/50',
        icon: TrendingDown,
        message: 'Stock muy bajo'
      };
    }

    // 3. Stock Bajo (Amarillo) - Stock actual ≥ Stock mínimo Y ≤ 30% del rango total
    if (porcentajeDelRango <= 30) {
      return {
        status: 'stock_bajo',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-900/50',
        icon: TrendingDown,
        message: 'Stock bajo'
      };
    }

    // 4. Stock Óptimo (Verde) - Stock actual entre 31% - 80% del rango total
    if (porcentajeDelRango <= 80) {
      return {
        status: 'stock_optimo',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-900/50',
        icon: Package,
        message: 'Stock óptimo'
      };
    }

    // 5. Stock Alto (Azul) - Stock actual entre 81% - 100% del rango total
    if (porcentajeDelRango <= 100) {
      return {
        status: 'stock_alto',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-900/50',
        icon: Package,
        message: 'Stock alto'
      };
    }

    // 6. Stock Excesivo (Morado) - Stock actual > Stock máximo
    return {
      status: 'stock_excesivo',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-900/50',
      icon: AlertTriangle,
      message: 'Stock excesivo'
    };
  };

  const stockStatus = getStockStatus();
  const stockPercentage = maxStock ? (currentStock / maxStock) * 100 : 0;
  const Icon = stockStatus.icon;

  if (variant === 'badge') {
    return (
      <StatusBadge
        status={stockStatus.status}
        size={size}
        showIcon={true}
        className={`${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor}`}
      />
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
        <Icon className={`w-4 h-4 ${stockStatus.color}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.message}
            </span>
            {showNumbers && (
              <span className="text-sm text-gray-600">
                {currentStock} {maxStock && `/ ${maxStock}`}
              </span>
            )}
          </div>
          {maxStock && (
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stockStatus.status === 'stock_critico' ? 'bg-red-500' :
                  stockStatus.status === 'stock_muy_bajo' ? 'bg-orange-500' :
                  stockStatus.status === 'stock_bajo' ? 'bg-yellow-500' :
                  stockStatus.status === 'stock_optimo' ? 'bg-green-500' :
                  stockStatus.status === 'stock_alto' ? 'bg-blue-500' :
                  stockStatus.status === 'stock_excesivo' ? 'bg-purple-500' : 'bg-gray-500'
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          stockStatus.status === 'stock_critico' ? 'bg-red-500' :
          stockStatus.status === 'stock_muy_bajo' ? 'bg-orange-500' :
          stockStatus.status === 'stock_bajo' ? 'bg-yellow-500' :
          stockStatus.status === 'stock_optimo' ? 'bg-green-500' :
          stockStatus.status === 'stock_alto' ? 'bg-blue-500' :
          stockStatus.status === 'stock_excesivo' ? 'bg-purple-500' : 'bg-gray-500'
        }`} />
        {showNumbers && (
          <span className="text-sm font-medium text-gray-700">
            {currentStock}
          </span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 ${stockStatus.bgColor} ${stockStatus.borderColor} border rounded-lg px-3 py-2`}>
      <Icon className={`w-4 h-4 ${stockStatus.color}`} />
      <div>
        <div className={`text-sm font-medium ${stockStatus.color}`}>
          {stockStatus.message}
        </div>
        {showNumbers && (
          <div className="text-xs text-gray-600">
            Actual: {currentStock} {minStock && `| Mín: ${minStock}`} {maxStock && `| Máx: ${maxStock}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockIndicator;
