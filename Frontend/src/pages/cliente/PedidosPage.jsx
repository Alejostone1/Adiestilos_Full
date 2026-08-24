import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Typography,
  Empty,
  Spin,
  Button,
  Row,
  Col,
  Statistic,
  message,
  Tag,
  Tooltip
} from 'antd';
import {
  ShoppingCartOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi } from '../../api/usuariosApi';

const { Title, Text } = Typography;

const PedidosPage = () => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalPedidos: 0,
    totalGastado: 0,
    pendientes: 0
  });

  useEffect(() => {
    if (usuario) {
      cargarPedidos();
    }
  }, [usuario]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const respuesta = await usuariosApi.getHistorialVentasUsuario(usuario.idUsuario);
      const datos = Array.isArray(respuesta?.datos) ? respuesta.datos
        : Array.isArray(respuesta?.datos?.datos) ? respuesta.datos.datos
        : Array.isArray(respuesta) ? respuesta : [];
      setPedidos(datos);

      // Calcular estadísticas
      const stats = {
        totalPedidos: datos.length,
        totalGastado: datos.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0) || 0,
        pendientes: datos.filter(p => p.estadoPago === 'pendiente').length || 0
      };
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      message.error('Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    const statusMap = {
      'pendiente': 'orange',
      'procesando': 'blue',
      'enviado': 'cyan',
      'entregado': 'green',
      'cancelado': 'red',
      'pagado': 'green'
    }
    return statusMap[estado?.toLowerCase()] || 'default';
  };

  const columns = [
    {
      title: 'Orden',
      dataIndex: 'numeroFactura',
      key: 'numeroFactura',
      render: (texto) => (
        <Text strong>#{texto}</Text>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'creadoEn',
      key: 'fecha',
      render: (fecha) => new Date(fecha).toLocaleDateString('es-CO'),
      width: 120
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => `$${parseFloat(total).toFixed(2)}`
    },
    {
      title: 'Estado',
      dataIndex: 'estadoPago',
      key: 'estado',
      render: (estado) => (
        <Tag color={getStatusColor(estado)}>
          {estado?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Acción',
      key: 'accion',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Tooltip title="Ver detalles">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => message.info('Funcionalidad en desarrollo')}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className="pedidos-page">
      <div className="pedidos-header">
        <Title level={2}>Mis Pedidos</Title>
        <Text>Historial completo de tus compras</Text>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total de Pedidos"
              value={estadisticas.totalPedidos}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Gastado"
              value={estadisticas.totalGastado}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pendientes"
              value={estadisticas.pendientes}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de Pedidos */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <Text>Cargando tus pedidos...</Text>
          </div>
        ) : pedidos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tienes pedidos aún"
            style={{ marginTop: '40px' }}
          >
            <Button 
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => window.location.href = '/cliente/compras'}
            >
              Ir a la Tienda
            </Button>
          </Empty>
        ) : (
          <Table
            dataSource={pedidos}
            columns={columns}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total: ${total} pedidos`
            }}
            rowKey="idVenta"
            scroll={{ x: 600 }}
          />
        )}
      </Card>
    </div>
  );
};

export default PedidosPage;
