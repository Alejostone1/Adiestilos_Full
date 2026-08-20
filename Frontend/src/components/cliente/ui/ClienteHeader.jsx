import React from 'react';

const ClienteHeader = ({
  title,
  subtitle,
  className = '',
  ...props
}) => {
  return (
    <header className={`sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 ${className}`} {...props}>
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
    </header>
  );
};

export default ClienteHeader;
