import React from 'react';
import { Card, Statistic, Row, Col, Skeleton, Typography, Tag } from 'antd';
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
      <Row gutter={[24, 24]} style={{ marginBottom: '12px' }}>
        {[1, 2, 3, 4].map(i => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card variant="borderless" style={{ borderRadius: '16px' }}>
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CO')}`;
  const formatNumber = (value) => Number(value).toLocaleString('es-CO');

  const kpis = [
    {
      title: 'Ingresos Totales',
      value: data?.resumenVentas?.totalVentas || 0,
      icon: <DollarOutlined />,
      color: '#3b82f6',
      formatter: formatCurrency,
      subtext: `Ventas del ${rango}`
    },
    {
      title: 'Pedidos Realizados',
      value: data?.resumenVentas?.numeroVentas || 0,
      icon: <ShoppingCartOutlined />,
      color: '#8b5cf6',
      formatter: formatNumber,
      subtext: `Volumen en el ${rango}`
    },
    {
      title: 'Créditos en curso',
      value: data?.resumenCreditos?.creditosActivos || 0,
      icon: <CreditCardOutlined />,
      color: '#f59e0b',
      formatter: formatNumber,
      subtext: 'Cuentas por cobrar'
    },
    {
      title: 'Nuevos Clientes',
      value: data?.nuevosClientes || 0,
      icon: <UserOutlined />,
      color: '#10b981',
      formatter: formatNumber,
      subtext: 'Registros recientes'
    }
  ];

  return (
    <Row gutter={[24, 24]}>
      {kpis.map((kpi, index) => (
        <Col key={index} xs={24} sm={12} lg={6}>
          <div className="card-3d card-elevated p-6 h-full flex flex-col group bg-white dark:bg-slate-800/60">
            <div className="flex justify-between items-start mb-6">
              <div 
                className="kpi-icon-container" 
                style={{ 
                  background: `${kpi.color}15`, 
                  color: kpi.color,
                }}
              >
                {kpi.icon}
              </div>
              <div className="card-3d bg-slate-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                <Text className="!text-[10px] !font-black !text-slate-500 dark:!text-slate-400 uppercase tracking-tighter">
                  {rango}
                </Text>
              </div>
            </div>
            
            <div className="flex-1">
              <Statistic
                title={<Text className="!text-slate-500 dark:!text-slate-400 !text-xs !font-bold !tracking-widest !uppercase !mb-1">{kpi.title}</Text>}
                value={kpi.value}
                formatter={kpi.formatter}
                styles={{ content: { fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' } }}
              />
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: kpi.color }} />
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
