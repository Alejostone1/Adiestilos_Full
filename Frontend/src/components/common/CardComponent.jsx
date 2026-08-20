import React from 'react';
import PropTypes from 'prop-types';

const CardComponent = ({
  title,
  children,
  variant = 'default',
  className = '',
  onClick,
  shadow = true,
  rounded = true,
  padding = 'md',
}) => {
  const baseStyles = 'bg-white transition-all duration-200';

  const variantStyles = {
    default: 'border border-gray-200',
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-600',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border border-yellow-600',
    info: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border border-cyan-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border border-purple-600',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border border-pink-600',
  };

  const shadowStyles = shadow ? 'shadow-lg hover:shadow-xl' : '';
  const roundedStyles = rounded ? 'rounded-lg' : '';
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }[padding];

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${shadowStyles} ${roundedStyles} ${paddingStyles} ${className}`;

  const cardContent = (
    <div className={combinedClasses}>
      {title && (
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${variant !== 'default' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>
      )}
      <div className={variant !== 'default' ? 'text-white' : 'text-gray-700'}>
        {children}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

CardComponent.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'purple',
    'pink',
  ]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  shadow: PropTypes.bool,
  rounded: PropTypes.bool,
  padding: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};

export default CardComponent;
