import React from 'react';

const ClienteMetric = ({
  title,
  value,
  icon,
  trend,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-3 ${className}`}
      {...props}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-xs font-medium ${trend.type === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};

export default ClienteMetric;
