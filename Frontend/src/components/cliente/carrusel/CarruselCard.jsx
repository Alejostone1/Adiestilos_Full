import React from 'react';
import { Card, Rate, Badge, Button, Space, Typography } from 'antd';
import {
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
  EyeOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

const CarruselCard = ({ producto, onView, onAddToCart }) => {
  const {
    nombre,
    precio,
    precioOriginal,
    calificacion,
    descuento,
    etiqueta,
    categoria,
    colores,
    tallas
  } = producto;

  const tieneDescuento = descuento > 0;
  const precioConDescuento = tieneDescuento ? precioOriginal * (1 - descuento / 100) : precio;

  return (
    <motion.div
      className="flex-shrink-0 w-64 mr-4"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Imagen */}
        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
          <EyeOutlined className="text-2xl text-gray-400" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {etiqueta && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${
                etiqueta === 'Nuevo' ? 'bg-green-500' :
                etiqueta === 'Más Vendido' ? 'bg-blue-500' :
                'bg-orange-500'
              }`}>
                {etiqueta}
              </span>
            )}
            {tieneDescuento && (
              <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                -{descuento}%
              </span>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors">
              <HeartOutlined className="text-sm" />
            </button>
            <button
              onClick={onView}
              className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors"
            >
              <EyeOutlined className="text-sm" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Categoría */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{categoria}</p>

          {/* Nombre */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {nombre}
          </h3>

          {/* Calificación */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-sm">
                  {i < Math.floor(calificacion) ? '★' : i < calificacion ? '☆' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-600">({calificacion.toFixed(1)})</span>
          </div>

          {/* Precios */}
          <div className="flex items-center gap-2 mb-3">
            {tieneDescuento ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  ${precioConDescuento.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${precioOriginal.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${precio.toFixed(2)}
              </span>
            )}
          </div>

          {/* Opciones */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            {colores && colores.length > 0 && (
              <div className="flex items-center gap-1">
                <span>{colores.length} color{colores.length !== 1 ? 'es' : ''}</span>
                <div className="flex gap-1">
                  {colores.slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: color === 'Rosa' ? '#ff69b4' :
                                       color === 'Azul' ? '#1890ff' :
                                       color === 'Blanco' ? '#fff' :
                                       color === 'Negro' ? '#000' :
                                       color === 'Rojo' ? '#ff4d4f' :
                                       color === 'Beige' ? '#f5deb3' :
                                       color === 'Gris' ? '#8c8c8c' : '#d9d9d9'
                      }}
                      title={color}
                    />
                  ))}
                  {colores.length > 3 && (
                    <span className="text-gray-400">+{colores.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {tallas && tallas.length > 0 && (
              <span>Tallas: {tallas.slice(0, 3).join(', ')}{tallas.length > 3 && ` +${tallas.length - 3}`}</span>
            )}
          </div>

          {/* Botón */}
          <Button
            type="primary"
            icon={<ShoppingOutlined />}
            onClick={onAddToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            size="large"
          >
            Agregar al Carrito
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CarruselCard;