import React from 'react';

const ClienteSection = ({
  title,
  subtitle,
  children,
  className = '',
  ...props
}) => {
  return (
    <section className={`py-6 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default ClienteSection;
