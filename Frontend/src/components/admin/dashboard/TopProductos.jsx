import React from 'react';
import { Avatar, Skeleton, Tag, Typography } from 'antd';
import { CrownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TopProductos = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </div>
    );
  }

  const topProductos = data?.topProductos || [];

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return { bg: '#fef3c7', text: '#d97706', label: 'ORO' };
      case 1: return { bg: '#f1f5f9', text: '#475569', label: 'PLATA' };
      case 2: return { bg: '#ffedd5', text: '#9a3412', label: 'BRONCE' };
      default: return { bg: 'transparent', text: '#94a3b8', label: `#${index + 1}` };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Title level={4} className="!m-0 !font-semibold dark:!text-white">Best Sellers</Title>
          <Paragraph className="!text-slate-500 dark:!text-slate-400 !text-sm !m-0">Productos de mayor rotación</Paragraph>
        </div>
        <div className="card-3d w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
          <CrownOutlined className="text-purple-600 dark:text-purple-400 text-xl" />
        </div>
      </div>

      {topProductos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-50">
          <CrownOutlined style={{ fontSize: '40px' }} className="mb-4" />
          <Text className="!font-semibold dark:!text-slate-300">Sin datos históricos</Text>        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {topProductos.slice(0, 5).map((item, index) => {
            const rank = getRankStyle(index);
            return (
              <div 
                key={index} 
                className="card-3d group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-all"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-xs shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: rank.bg, color: rank.text }}
                >
                  {rank.label}
                </div>

                <div className="flex-1 min-w-0">
                  <Text className="!font-semibold block truncate !text-sm dark:!text-slate-200 group-hover:text-blue-500 transition-colors">
                    {item.variante?.producto?.nombreProducto || 'Producto desconocido'}
                  </Text>
                  <Text className="!text-[11px] !text-slate-400 dark:!text-slate-500 !font-medium">
                    {item.variante?.color?.nombreColor} / {item.variante?.talla?.nombreTalla}
                  </Text>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <ArrowUpOutlined className="text-emerald-500 text-[11px]" />
                    <Text className="!font-semibold !text-sm dark:!text-slate-200">{item._sum.cantidad}</Text>
                  </div>
                  <Text className="!text-[11px] !text-slate-400 dark:!text-slate-500 !font-semibold uppercase tracking-wide">UNIDADES</Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <button className="w-full py-2 text-blue-500 dark:text-blue-400 font-semibold text-sm hover:underline">Ver reporte detallado</button>
      </div>
    </div>
  );
};

export default TopProductos;
