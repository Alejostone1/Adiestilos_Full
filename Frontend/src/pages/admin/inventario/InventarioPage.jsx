import React, { useState, useEffect } from 'react';
import {
  obtenerStockActual,
  obtenerEstadisticasInventario
} from '../../../api/inventarioApi';
import { Button, Table, Card, Statistic, Row, Col, Input, Select, Space, Tag, Spin, message } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const InventarioPage = () => {
  const [stock, setStock] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    pagina: 1,
    limite: 15,
    search: '',
    stockBajo: false,
    sinStock: false
  });
  const navigate = useNavigate();

  // Cargar datos del inventario
  const cargarInventario = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas
      const responseEstadisticas = await obtenerEstadisticasInventario();
      setEstadisticas(responseEstadisticas?.datos || {});

      // Cargar stock con filtros
      const params = { ...filtros };
      if (!filtros.stockBajo) delete params.stockBajo;
      if (!filtros.sinStock) delete params.sinStock;
      if (!filtros.search) delete params.search;

      const responseStock = await obtenerStockActual(params);
      setStock(responseStock.datos || {});
    } catch (error) {
      message.error('Error al cargar inventario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, [filtros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: 1 // Resetear página al cambiar filtros
    }));
  };

  // Obtener estado del stock
  const obtenerEstadoStock = (variante) => {
    if (variante.cantidadStock === 0) return { estado: 'sin_stock', color: 'red', icon: <CloseCircleOutlined />, texto: 'Sin Stock' };
    if (variante.cantidadStock <= variante.stockMinimo) return { estado: 'bajo', color: 'orange', icon: <ExclamationCircleOutlined />, texto: 'Stock Bajo' };
    return { estado: 'normal', color: 'green', icon: <CheckCircleOutlined />, texto: 'Normal' };
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Producto',
      dataIndex: ['producto', 'nombreProducto'],
      key: 'producto',
      sorter: (a, b) => a.producto.nombreProducto.localeCompare(b.producto.nombreProducto),
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{text}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            SKU: {record.codigoSku || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Variante',
      key: 'variante',
      render: (_, record) => (
        <div className="text-gray-900 dark:text-white">
          <div>Color: {record.color?.nombreColor || 'N/A'}</div>
          <div>Talla: {record.talla?.nombreTalla || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Stock Actual',
      dataIndex: 'cantidadStock',
      key: 'cantidadStock',
      sorter: (a, b) => a.cantidadStock - b.cantidadStock,
      render: (cantidad, record) => {
        const estado = obtenerEstadoStock(record);
        return (
          <Tag color={estado.color}>
            {estado.icon} {cantidad}
          </Tag>
        );
      },
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => {
        const estado = obtenerEstadoStock(record);
        return (
          <Tag color={estado.color}>
            {estado.texto}
          </Tag>
        );
      },
      filters: [
        { text: 'Normal', value: 'normal' },
        { text: 'Stock Bajo', value: 'bajo' },
        { text: 'Sin Stock', value: 'sin_stock' },
      ],
      onFilter: (value, record) => {
        const estado = obtenerEstadoStock(record);
        return estado.estado === value;
      },
    },
    {
      title: 'Límites',
      key: 'limites',
      render: (_, record) => (
        <div className="text-gray-900 dark:text-white">
          <div>Mín: {record.stockMinimo || 0}</div>
          <div>Máx: {record.stockMaximo || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Precio Costo',
      dataIndex: 'precioCosto',
      key: 'precioCosto',
      render: (precio) => <span className="text-gray-900 dark:text-white">{precio ? `$${Number(precio).toFixed(2)}` : 'N/A'}</span>,
      sorter: (a, b) => (Number(a.precioCosto) || 0) - (Number(b.precioCosto) || 0),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/inventario/movimientos?variante=${record.idVariante}`)}
            title="Ver movimientos"
          >
            Movimientos
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/inventario/ajustes/nuevo?variante=${record.idVariante}`)}
            title="Ajustar inventario"
          >
            Ajustar
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">Inventario</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard visual del stock actual de productos
          </p>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => navigate('/admin/inventario/ajustes')}
            className="dark:bg-blue-600 dark:border-blue-600"
          >
            Nuevo Ajuste
          </Button>
          <Button
            onClick={() => navigate('/admin/inventario/movimientos')}
            className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 dark:bg-slate-800 hover:dark:bg-slate-700"
          >
            Ver Movimientos
          </Button>
        </Space>
      </div>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <Statistic
              title={<span className="text-gray-600 dark:text-gray-400">Total Productos</span>}
              value={estadisticas.totalProductos || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <Statistic
              title={<span className="text-gray-600 dark:text-gray-400">Stock Bajo</span>}
              value={estadisticas.productosBajoStock || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: estadisticas.productosBajoStock > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <Statistic
              title={<span className="text-gray-600 dark:text-gray-400">Sin Stock</span>}
              value={estadisticas.productosSinStock || 0}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: estadisticas.productosSinStock > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <Statistic
              title={<span className="text-gray-600 dark:text-gray-400">Valor Total</span>}
              value={estadisticas.valorTotalInventario || 0}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 mb-6">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Input
              placeholder="Buscar por producto..."
              prefix={<SearchOutlined className="text-gray-400 dark:text-gray-500" />}
              value={filtros.search}
              onChange={(e) => handleFiltroChange('search', e.target.value)}
              allowClear
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Estado de stock"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => {
                handleFiltroChange('stockBajo', value === 'bajo');
                handleFiltroChange('sinStock', value === 'sin_stock');
              }}
              className="dark:bg-slate-700 dark:[&_.ant-select-selector]:border-slate-600 dark:[&_.ant-select-selector]:bg-slate-700 dark:[&_.ant-select-selector]:text-white"
            >
              <Option value="bajo">Stock Bajo</Option>
              <Option value="sin_stock">Sin Stock</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              onClick={() => setFiltros({
                pagina: 1,
                limite: 15,
                search: '',
                stockBajo: false,
                sinStock: false
              })}
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 dark:bg-slate-800 hover:dark:bg-slate-700"
            >
              Limpiar Filtros
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla de inventario */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <Table
          columns={columns}
          dataSource={stock.datos || []}
          rowKey="idVariante"
          pagination={{
            current: stock.paginacion?.paginaActual || 1,
            pageSize: stock.paginacion?.registrosPorPagina || 15,
            total: stock.paginacion?.totalRegistros || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
            onChange: (page, pageSize) => {
              setFiltros(prev => ({
                ...prev,
                pagina: page,
                limite: pageSize
              }));
            },
          }}
          scroll={{ x: 1000 }}
          className="[&_.ant-table]:bg-transparent dark:[&_.ant-table]:bg-transparent"
          rowClassName={() => 'dark:border-slate-700 hover:dark:bg-slate-700'}
        />
      </div>
    </div>
  );
};

export default InventarioPage;
