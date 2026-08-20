import React from 'react';
import { Badge, Tag, Skeleton, Typography } from 'antd';
import { ExclamationCircleOutlined, StopOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const InventarioAlertas = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton active paragraph={{ rows: 4 }} title={{ width: '60%' }} />
      </div>
    );
  }

  const alertas = [];

  // Agregar productos con stock bajo
  if (data?.stockBajo?.items) {
    data.stockBajo.items.forEach(item => {
      alertas.push({
        tipo: 'stock_bajo',
        icon: <WarningOutlined className="text-amber-500" />,
        titulo: 'Stock Bajo',
        descripcion: item.producto.nombreProducto,
        detalle: `Actual: ${item.cantidadStock} / Mín: ${item.stockMinimo}`,
        color: 'orange',
        urgencia: 'media'
      });
    });
  }

  // Filtrar duplicados o similares si es necesario (aquí asumimos datos directos)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Title level={4} className="!m-0 !font-black dark:!text-white">Alertas Críticas</Title>
          <Paragraph className="!text-slate-500 dark:!text-slate-400 !text-sm !m-0">Monitoreo de stock y quiebres</Paragraph>
        </div>
        <div className="relative">
          <div className="card-3d w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <BellOutlined className="text-amber-600 dark:text-amber-400 text-xl" />
          </div>
          {alertas.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full" />
          )}
        </div>
      </div>

      {alertas.length === 0 ? (
        <div className="card-3d flex-1 flex flex-col items-center justify-center py-10 opacity-50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-800/50">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
             <BellOutlined className="text-emerald-600 dark:text-emerald-400 text-xl" />
          </div>
          <Text className="!font-bold !text-emerald-700 dark:!text-emerald-400">Todo en orden</Text>
          <Text className="!text-xs !text-emerald-600/70 dark:!text-emerald-400/70">No hay alertas pendientes</Text>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
          {alertas.map((item, index) => (
            <div 
              key={index}
              className="card-3d p-4 rounded-2xl bg-white dark:bg-slate-800/40 flex gap-4 items-start hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                item.urgencia === 'alta' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <Text className="!font-black !text-xs dark:!text-slate-200 uppercase tracking-wider text-gradient" style={{ filter: 'brightness(0.8)' }}>
                    {item.titulo}
                  </Text>
                  <Tag color={item.color} className="!rounded-md !border-0 !text-[10px] !font-black !px-2 !m-0 uppercase">CRÍTICO</Tag>
                </div>
                <Text className="!font-bold block truncate !text-sm dark:!text-slate-200">
                  {item.descripcion}
                </Text>
                <Text className="!text-[11px] !text-slate-500 dark:!text-slate-500 !font-medium">
                  {item.detalle}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <button className="w-full py-2 text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Ignorar todas</button>
      </div>
    </div>
  );
};

export default InventarioAlertas;
