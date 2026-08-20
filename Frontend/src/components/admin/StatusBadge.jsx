import React from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingDown, Package } from 'lucide-react';

const StatusBadge = ({
  status,
  size = 'sm',
  variant = 'default',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case 'activo':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-900/50',
          icon: CheckCircle,
          label: 'Activo'
        };
      case 'inactivo':
        return {
          bg: 'bg-gray-100 dark:bg-slate-700',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-slate-600',
          icon: XCircle,
          label: 'Inactivo'
        };
      case 'descontinuado':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-900/50',
          icon: TrendingDown,
          label: 'Descontinuado'
        };
      case 'pendiente':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-900/50',
          icon: AlertCircle,
          label: 'Pendiente'
        };
      case 'bajo_stock':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-800 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-900/50',
          icon: AlertCircle,
          label: 'Bajo Stock'
        };
      case 'sin_stock':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-900/50',
          icon: XCircle,
          label: 'Sin Stock'
        };
      case 'stock_critico':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-900/50',
          icon: XCircle,
          label: 'Stock Crítico'
        };
      case 'stock_muy_bajo':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-800 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-900/50',
          icon: AlertCircle,
          label: 'Stock Muy Bajo'
        };
      case 'stock_bajo':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-900/50',
          icon: TrendingDown,
          label: 'Stock Bajo'
        };
      case 'stock_optimo':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-900/50',
          icon: Package,
          label: 'Stock Óptimo'
        };
      case 'stock_alto':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-900/50',
          icon: Package,
          label: 'Stock Alto'
        };
      case 'stock_excesivo':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-800 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-900/50',
          icon: AlertCircle,
          label: 'Stock Excesivo'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-slate-700',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-slate-600',
          icon: Package,
          label: status || 'Desconocido'
        };
    }
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
    xl: 'px-5 py-2 text-base'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const baseClasses = `inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border} ${className}`;

  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center gap-1 ${config.text} ${className}`}>
        {showIcon && <Icon className={iconSizes[size]} />}
        <span className="text-xs font-medium">{config.label}</span>
      </span>
    );
  }

  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${config.bg.replace('100', '500')}`} />
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <span className={baseClasses}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
