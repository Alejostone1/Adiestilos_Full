import React from 'react';
import { Palette } from 'lucide-react';

const ColorSwatch = ({ 
  color, 
  size = 'sm', 
  showName = false, 
  showTooltip = true,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const getContrastColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#')) return '#000000';
    
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  if (!color) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-full border-2 border-gray-300 flex items-center justify-center`}>
          <Palette className={`${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`} />
        </div>
        {showName && <span className="text-sm text-gray-500">Sin color</span>}
      </div>
    );
  }

  const displayColor = color.codigoHex || '#cccccc';
  const borderColor = getContrastColor(displayColor) === '#FFFFFF' ? '#e5e7eb' : '#374151';
  const textColor = getContrastColor(displayColor);

  const swatch = (
    <div
      className={`${sizeClasses[size]} rounded-full border-2 shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md ${className}`}
      style={{
        backgroundColor: displayColor,
        borderColor: borderColor
      }}
      title={showTooltip ? color.nombreColor : undefined}
    />
  );

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        {swatch}
        <span className="text-sm font-medium text-gray-700">
          {color.nombreColor}
        </span>
      </div>
    );
  }

  return swatch;
};

export default ColorSwatch;
