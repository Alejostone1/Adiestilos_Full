import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Skeleton, Typography } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

const { Title, Text } = Typography;

/**
 * Custom hook to track element dimensions robustly
 */
const useDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        // Only update if we have real dimensions to avoid Recharts -1 bug
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, dimensions];
};

const VentasChart = ({ data, loading, tipo = 'line' }) => {
  const { isDark } = useTheme();
  const [containerRef, dimensions] = useDimensions();

  // Formatear los datos del gráfico con useMemo para estabilidad
  const displayData = useMemo(() => {
    const chartData = data?.graficoVentas?.map(item => ({
      fecha: new Date(item.fecha).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit'
      }),
      ventas: Number(item.totalVentas) || 0
    })) || [];

    return chartData.length > 0 ? chartData : [
      { fecha: '01/01', ventas: 0 },
      { fecha: '02/01', ventas: 0 },
      { fecha: '03/01', ventas: 0 },
      { fecha: '04/01', ventas: 0 },
      { fecha: '05/01', ventas: 0 },
      { fecha: '06/01', ventas: 0 },
      { fecha: '07/01', ventas: 0 }
    ];
  }, [data]);

  const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CO')}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 border border-pink-200/50 dark:border-pink-500/20 rounded-2xl shadow-2xl transition-all">
          <Text className="!text-slate-400 !text-[10px] !font-black block mb-1 uppercase tracking-widest">{label}</Text>
          <Text className="!text-pink-600 dark:!text-pink-400 !text-xl !font-black block">
            {formatCurrency(payload[0].value)}
          </Text>
        </div>
      );
    }
    return null;
  };

  const axisColor = isDark ? '#f9a8d4' : '#be185d';
  const gridColor = isDark ? 'rgba(190, 24, 93, 0.08)' : 'rgba(251, 207, 232, 0.2)';

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton active title={{ width: 180 }} paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-8 shrink-0 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
             <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
             <Title level={4} className="!m-0 !font-black !text-pink-950 dark:!text-pink-100 uppercase !text-[10px] tracking-[0.2em] opacity-70">Rendimiento Operativo</Title>
          </div>
          <Title level={2} className="!m-0 !font-black !text-slate-900 dark:!text-white !tracking-tight">Flujo de Ventas</Title>
        </div>
        <div className="hidden sm:flex flex-col items-end">
           <div className="bg-pink-500/10 dark:bg-pink-500/20 px-4 py-1.5 rounded-2xl border border-pink-500/20 mb-2">
             <Text className="!text-pink-600 dark:!text-pink-300 !text-[10px] !font-black uppercase tracking-widest flex items-center gap-2">
                <RiseOutlined /> En tiempo real
             </Text>
           </div>
        </div>
      </div>

      {/* Contenedor Ref con tamaño observado */}
      <div 
        ref={containerRef}
        className="flex-1 w-full relative group"
        style={{ 
          minHeight: '350px',
          maxHeight: '400px',
          width: '100%'
        }}
      >
        {/* Usamos dimensiones calculadas manualmente para "engañar" a Recharts y evitar el error del width por defecto (-1) */}
        {dimensions.width > 0 && dimensions.height > 0 && (
          <ResponsiveContainer 
            id="ventas-main-chart"
            width={Math.floor(dimensions.width)} 
            height={Math.floor(dimensions.height)}
          >
            {tipo === 'bar' ? (
              <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="fecha"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisColor, fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisColor, fontSize: 10, fontWeight: 800 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip cursor={{ fill: 'rgba(236, 72, 153, 0.05)' }} content={<CustomTooltip />} />
                <Bar
                  dataKey="ventas"
                  fill="var(--accent-primary)"
                  radius={[6, 6, 0, 0]}
                  barSize={dimensions.width < 500 ? 15 : 28}
                  animationBegin={200}
                  animationDuration={1000}
                />
              </BarChart>
            ) : (
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="fecha"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisColor, fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisColor, fontSize: 10, fontWeight: 800 }}
                  tickFormatter={(val) => val === 0 ? '$0' : `$${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="var(--accent-primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  animationDuration={1500}
                  dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: isDark ? '#1a0614' : '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, shadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default VentasChart;
