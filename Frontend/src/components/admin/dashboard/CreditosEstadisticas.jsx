import React from 'react';
import { Card, Statistic, Row, Col, Skeleton, Progress } from 'antd';
import { CreditCardOutlined, DollarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

const CreditosEstadisticas = ({ data, loading }) => {
  if (loading) {
    return (
      <Card
        title="Estadísticas de Créditos"
        className="shadow-sm"
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map(i => (
            <Col key={i} xs={24} sm={8}>
              <Skeleton active />
            </Col>
          ))}
        </Row>
      </Card>
    );
  }

  const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CO')}`;
  const formatNumber = (value) => Number(value).toLocaleString('es-CO');

  const creditosActivos = data?.resumen?.numeroCreditos || 0;
  const saldoPendiente = data?.resumen?.saldoPendienteTotal || 0;
  const montoOriginal = data?.resumen?.montoOriginalTotal || 0;

  // Calcular porcentaje de recuperación
  const porcentajeRecuperado = montoOriginal > 0 ? ((montoOriginal - saldoPendiente) / montoOriginal) * 100 : 0;

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <CreditCardOutlined />
          Estadísticas de Créditos
        </div>
      }
      className="shadow-sm"
      style={{ marginBottom: '24px' }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Statistic
            title="Créditos Activos"
            value={creditosActivos}
            prefix={<CreditCardOutlined style={{ color: '#f59e0b' }} />}
            formatter={formatNumber}
            styles={{ content: { color: '#f59e0b', fontSize: '20px' } }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Saldo Pendiente"
            value={saldoPendiente}
            prefix={<DollarOutlined style={{ color: '#ef4444' }} />}
            formatter={formatCurrency}
            styles={{ content: { color: '#ef4444', fontSize: '20px' } }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <div>
            <Statistic
              title="Recuperación"
              value={Math.round(porcentajeRecuperado)}
              suffix="%"
              styles={{
                content: {
                  color: porcentajeRecuperado >= 80 ? '#10b981' : porcentajeRecuperado >= 60 ? '#f59e0b' : '#ef4444',
                  fontSize: '20px'
                }
              }}
            />
            <Progress
              percent={Math.round(porcentajeRecuperado)}
              showInfo={false}
              strokeColor={
                porcentajeRecuperado >= 80 ? '#10b981' : porcentajeRecuperado >= 60 ? '#f59e0b' : '#ef4444'
              }
              size="small"
              style={{ marginTop: '8px' }}
            />
          </div>
        </Col>
      </Row>

      {data?.creditos && data.creditos.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Créditos Más Recientes</h4>
          <Row gutter={[16, 16]}>
            {data.creditos.slice(0, 3).map((credito, index) => (
              <Col key={index} xs={24} sm={8}>
                <Card size="small" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {credito.usuarioCliente.nombres} {credito.usuarioCliente.apellidos}
                    </div>
                    <div className="text-gray-600">
                      Factura: {credito.venta.numeroFactura}
                    </div>
                    <div className="text-red-600 font-medium">
                      ${Number(credito.saldoPendiente).toLocaleString('es-CO')}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Card>
  );
};

export default CreditosEstadisticas;