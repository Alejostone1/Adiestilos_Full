import React from 'react';

const LoaderComponent = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-24 h-24 border-8',
  };

  const spinnerClasses = `
    border-blue-500
    border-t-transparent
    rounded-full
    animate-spin
  `;

  return (
    <div className="flex justify-center items-center">
      <div className={`${spinnerClasses} ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoaderComponent;
