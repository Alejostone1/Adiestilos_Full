import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Empty,
  Pagination,
  Typography,
  Space,
  Drawer,
  message,
  Spin
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import publicApi from '../../../api/publicApi';
import ClienteProductCard from '../../../components/cliente/cards/ClienteProductCard';

const { Title, Text } = Typography;

const ComprasPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(12);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [ordenar, setOrdenar] = useState('nombre');
  const [filtroDrawerVisible, setFiltroDrawerVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filtros, setFiltros] = useState({
    precioMin: 0,
    precioMax: 10000,
    categoria: null
  });

  useEffect(() => {
    cargarProductos();
  }, [pagina, limite, busqueda, ordenar, filtros]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const opciones = {
        pagina,
        limite,
        ordenar,
        q: busqueda || undefined,
        precioMin: filtros.precioMin,
        precioMax: filtros.precioMax,
        idCategoria: filtros.categoria
      };

      Object.keys(opciones).forEach(k => 
        opciones[k] === undefined && delete opciones[k]
      );

      const respuesta = await publicApi.obtenerProductosPublicos(opciones);
      setProductos(respuesta.datos || []);
      setTotal(respuesta.total || 0);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      message.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(1);
  };

  const handleCambiarOrden = (valor) => {
    setOrdenar(valor);
    setPagina(1);
  };

  const handleFiltroGuardar = () => {
    setPagina(1);
    setFiltroDrawerVisible(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      precioMin: 0,
      precioMax: 10000,
      categoria: null
    });
    setBusqueda('');
    setPagina(1);
  };

  return (
    <div className="compras-page">
      <div className="compras-header">
        <Title level={2} className="page-title">Nuestra Tienda</Title>
        <Text className="page-subtitle">
          Explora nuestros {total} productos disponibles
        </Text>
      </div>

      <Card className="controles-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input
              placeholder="Buscar productos..."
              prefix={<SearchOutlined />}
              value={busqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              size="large"
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={ordenar}
              onChange={handleCambiarOrden}
              options={[
                { label: 'Nombre A-Z', value: 'nombre' },
                { label: 'Precio ↑', value: 'precio_asc' },
                { label: 'Precio ↓', value: 'precio_desc' },
                { label: 'Más Nuevo', value: 'nuevo' },
                { label: 'Más Vendido', value: 'vendido' }
              ]}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Space orientation="horizontal">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltroDrawerVisible(true)}
              >
                Filtros
              </Button>
              <div className="view-toggle">
                <Button
                  icon={<AppstoreOutlined />}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                  size="small"
                />
                <Button
                  icon={<UnorderedListOutlined />}
                  type={viewMode === 'lista' ? 'primary' : 'default'}
                  onClick={() => setViewMode('lista')}
                  size="small"
                />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      <Drawer
        title="Filtros Avanzados"
        placement="left"
        onClose={() => setFiltroDrawerVisible(false)}
        open={filtroDrawerVisible}
        size="large"
      >
        <div className="filtros-content">
          <div className="filtro-section">
            <Text strong>Rango de Precio</Text>
            <div className="precio-inputs">
              <Input
                type="number"
                placeholder="Mín"
                value={filtros.precioMin}
                onChange={(e) => setFiltros({
                  ...filtros,
                  precioMin: parseFloat(e.target.value) || 0
                })}
              />
              <Input
                type="number"
                placeholder="Máx"
                value={filtros.precioMax}
                onChange={(e) => setFiltros({
                  ...filtros,
                  precioMax: parseFloat(e.target.value) || 10000
                })}
              />
            </div>
          </div>

          <Space orientation="vertical" style={{ width: '100%', marginTop: '16px' }}>
            <Button type="primary" block onClick={handleFiltroGuardar}>
              Aplicar Filtros
            </Button>
            <Button block onClick={handleLimpiarFiltros}>
              Limpiar Filtros
            </Button>
          </Space>
        </div>
      </Drawer>

      <div className="productos-container">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Cargando productos...</Text>
          </div>
        ) : productos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No se encontraron productos"
            style={{ marginTop: '40px' }}
          >
            <Button type="primary" onClick={handleLimpiarFiltros}>
              Ver Todos los Productos
            </Button>
          </Empty>
        ) : (
          <>
            <Row 
              gutter={[16, 16]} 
              className={`productos-${viewMode}`}
            >
              {productos.map((producto) => (
                <Col
                  key={producto.idProducto}
                  xs={24}
                  sm={viewMode === 'lista' ? 24 : 12}
                  md={viewMode === 'lista' ? 24 : 8}
                  lg={viewMode === 'lista' ? 24 : 6}
                >
                  <ClienteProductCard 
                    producto={producto}
                    viewMode={viewMode}
                  />
                </Col>
              ))}
            </Row>

            <div className="paginacion-container">
              <Pagination
                current={pagina}
                total={total}
                pageSize={limite}
                onChange={(p) => setPagina(p)}
                pageSizeOptions={['12', '24', '48']}
                onShowSizeChange={(_, size) => setLimite(size)}
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} de ${total} productos`
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComprasPage;