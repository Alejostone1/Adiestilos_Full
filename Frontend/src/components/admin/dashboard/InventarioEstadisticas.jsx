import React from 'react';
import { Card, Statistic, Row, Col, Skeleton, Progress } from 'antd';
import { InboxOutlined, DollarOutlined, AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';

const InventarioEstadisticas = ({ data, loading }) => {
  if (loading) {
    return (
      <Card
        title="Estadísticas de Inventario"
        className="shadow-sm"
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col key={i} xs={24} sm={12} md={6}>
              <Skeleton active />
            </Col>
          ))}
        </Row>
      </Card>
    );
  }

  const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CO')}`;
  const formatNumber = (value) => Number(value).toLocaleString('es-CO');

  // Calcular estadísticas
  const valorTotal = data?.valoracion?.resumen?.valorTotalCosto || 0;
  const numeroSkus = data?.valoracion?.resumen?.numeroSkus || 0;
  const unidadesTotales = data?.valoracion?.resumen?.unidadesTotales || 0;
  const productosBajoStock = data?.stockBajo?.totalItems || 0;
  const productosSinStock = data?.sinStock?.totalItems || 0;

  // Calcular porcentaje de productos en buen estado
  const totalProductos = numeroSkus;
  const productosCriticos = productosBajoStock + productosSinStock;
  const porcentajeBuenEstado = totalProductos > 0 ? ((totalProductos - productosCriticos) / totalProductos) * 100 : 100;

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <InboxOutlined />
          Estadísticas de Inventario
        </div>
      }
      className="shadow-sm"
      style={{ marginBottom: '24px' }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Valor Total Inventario"
            value={valorTotal}
            prefix={<DollarOutlined style={{ color: '#10b981' }} />}
            formatter={formatCurrency}
            styles={{ content: { color: '#10b981', fontSize: '20px' } }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Total SKU's"
            value={numeroSkus}
            prefix={<InboxOutlined style={{ color: '#3b82f6' }} />}
            formatter={formatNumber}
            styles={{ content: { color: '#3b82f6', fontSize: '20px' } }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Unidades Totales"
            value={unidadesTotales}
            prefix={<InboxOutlined style={{ color: '#8b5cf6' }} />}
            formatter={formatNumber}
            styles={{ content: { color: '#8b5cf6', fontSize: '20px' } }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div>
            <Statistic
              title="Estado del Inventario"
              value={Math.round(porcentajeBuenEstado)}
              suffix="%"
              styles={{
                content: {
                  color: porcentajeBuenEstado >= 80 ? '#10b981' : porcentajeBuenEstado >= 60 ? '#f59e0b' : '#ef4444',
                  fontSize: '20px'
                }
              }}
            />
            <Progress
              percent={Math.round(porcentajeBuenEstado)}
              showInfo={false}
              strokeColor={
                porcentajeBuenEstado >= 80 ? '#10b981' : porcentajeBuenEstado >= 60 ? '#f59e0b' : '#ef4444'
              }
              size="small"
              style={{ marginTop: '8px' }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title="Productos con Stock Bajo"
              value={productosBajoStock}
              prefix={<AlertOutlined style={{ color: '#f59e0b' }} />}
              styles={{ content: { color: '#f59e0b' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ borderLeft: '4px solid #ef4444' }}>
            <Statistic
              title="Productos Sin Stock"
              value={productosSinStock}
              prefix={<AlertOutlined style={{ color: '#ef4444' }} />}
              styles={{ content: { color: '#ef4444' } }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default InventarioEstadisticas;