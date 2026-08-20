import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PedidosPage = () => {
  return (
    <div className="pedidos-page">
      <div className="pedidos-header">
        <Title level={2}>Mis Pedidos</Title>
        <Text>Revisa el estado y el historial de tus compras</Text>
      </div>
      
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={3}>Pedidos en Construcción</Title>
          <Text>Pronto podrás ver el historial completo de tus compras aquí</Text>
          <div style={{ marginTop: '20px' }}>
            <Button type="primary">Ver Primeras Compras</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PedidosPage;