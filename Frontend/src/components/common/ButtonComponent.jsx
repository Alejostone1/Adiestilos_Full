import React from 'react';

const ButtonComponent = ({
  onClick,
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  };

  const disabledStyles = 'disabled:bg-gray-300 disabled:cursor-not-allowed';

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {children}
    </button>
  );
};

export default ButtonComponent;
