import React from 'react';
import { Row, Col, Skeleton, Typography } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const DashboardKPIs = ({ data, loading, rango }) => {
  if (loading) {
    return (
      <Row gutter={[20, 20]}>
        {[1, 2, 3, 4].map(i => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <div className="card-3d h-full p-6">
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </div>
          </Col>
        ))}
      </Row>
    );
  }

  const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CO')}`;
  const formatNumber = (value) => Number(value).toLocaleString('es-CO');

  const rangeLabel = rango === 'dia' ? 'Hoy' : rango === 'semana' ? 'Semana' : 'Mes';

  const kpis = [
    {
      title: 'Ingresos Totales',
      value: data?.resumenVentas?.totalVentas || 0,
      icon: <DollarOutlined />,
      color: '#ec4899',
      bg: '#fdf2f8',
      formatter: formatCurrency,
      subtext: `Ventas del ${rangeLabel}`
    },
    {
      title: 'Pedidos Realizados',
      value: data?.resumenVentas?.numeroVentas || 0,
      icon: <ShoppingCartOutlined />,
      color: '#db2777',
      bg: '#fdf2f8',
      formatter: formatNumber,
      subtext: `Volumen en el ${rangeLabel}`
    },
    {
      title: 'Créditos en curso',
      value: data?.resumenCreditos?.creditosActivos || 0,
      icon: <CreditCardOutlined />,
      color: '#f59e0b',
      bg: '#fffbeb',
      formatter: formatNumber,
      subtext: 'Cuentas por cobrar'
    },
    {
      title: 'Nuevos Clientes',
      value: data?.nuevosClientes || 0,
      icon: <UserOutlined />,
      color: '#10b981',
      bg: '#ecfdf5',
      formatter: formatNumber,
      subtext: 'Registros recientes'
    }
  ];

  return (
    <Row gutter={[20, 20]}>
      {kpis.map((kpi, index) => (
        <Col key={index} xs={24} sm={12} lg={6}>
          <div className="card-3d h-full p-5 flex flex-col group hover:-translate-y-1">
            <div className="flex justify-between items-start mb-5">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: kpi.bg, color: kpi.color }}
              >
                {kpi.icon}
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {rangeLabel}
              </span>
            </div>
            
            <Text className="!text-slate-400 dark:!text-slate-500 !text-xs !font-semibold !uppercase !tracking-wide block mb-1">
              {kpi.title}
            </Text>
            <Text className="!text-2xl md:!text-[26px] !font-bold !text-slate-900 dark:!text-white !tracking-tight block" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {kpi.formatter(kpi.value)}
            </Text>
            
            <div className="mt-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: kpi.color }} />
              <Text className="!text-slate-400 dark:!text-slate-500 !text-xs !font-medium">
                {kpi.subtext}
              </Text>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardKPIs;

