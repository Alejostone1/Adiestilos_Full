import React, { useState, useEffect } from 'react';
import { obtenerMovimientos } from '../../../api/movimientosApi';
import { obtenerTodosLosTiposMovimiento } from '../../../api/tiposMovimientoApi';
import { Button, Table, DatePicker, Select, Input, Space, Tag, Spin, Card, Row, Col } from 'antd';
import { SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, SettingOutlined, ShoppingOutlined, PayCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const MovimientosInventarioPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtros
  const [filtros, setFiltros] = useState({
    pagina: parseInt(searchParams.get('pagina')) || 1,
    limite: parseInt(searchParams.get('limite')) || 20,
    idVariante: searchParams.get('variante') || '',
    idTipoMovimiento: searchParams.get('tipoMovimiento') || '',
    fechaInicio: searchParams.get('fechaInicio') || '',
    fechaFin: searchParams.get('fechaFin') || '',
    search: searchParams.get('search') || '',
  });

  // Cargar movimientos
  const cargarMovimientos = async () => {
    try {
      setLoading(true);

      // Construir parámetros de consulta
      const params = {
        ...filtros,
        page: filtros.pagina, // El backend espera 'page' no 'pagina'
        pageSize: filtros.limite, // El backend espera 'pageSize' no 'limite'
      };

      // Remover los parámetros antiguos
      delete params.pagina;
      delete params.limite;

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await obtenerMovimientos(params);

      // La respuesta del backend viene en response.datos
      const movimientosData = response.datos || {};
      setMovimientos({
        datos: movimientosData.movimientos || [],
        paginacion: {
          paginaActual: movimientosData.page || 1,
          registrosPorPagina: movimientosData.pageSize || 20,
          totalRegistros: movimientosData.total || 0,
          totalPaginas: movimientosData.totalPages || 0
        }
      });
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tipos de movimiento
  const cargarTiposMovimiento = async () => {
    try {
      const response = await obtenerTodosLosTiposMovimiento();
      setTiposMovimiento(response.datos?.datos || response.datos || []);
    } catch (error) {
      console.error('Error al cargar tipos de movimiento:', error);
    }
  };

  useEffect(() => {
    cargarTiposMovimiento();
  }, []);

  useEffect(() => {
    cargarMovimientos();
  }, [filtros]);

  // Actualizar URL con filtros
  useEffect(() => {
    const params = {};
    Object.keys(filtros).forEach(key => {
      if (filtros[key] && filtros[key] !== '') {
        params[key] = filtros[key];
      }
    });
    setSearchParams(params);
  }, [filtros, setSearchParams]);

  // Manejar cambios en filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      pagina: 1 // Resetear página al cambiar filtros
    }));
  };

  // Manejar cambio de rango de fechas
  const handleFechaChange = (dates) => {
    if (dates) {
      handleFiltroChange('fechaInicio', dates[0].format('YYYY-MM-DD'));
      handleFiltroChange('fechaFin', dates[1].format('YYYY-MM-DD'));
    } else {
      handleFiltroChange('fechaInicio', '');
      handleFiltroChange('fechaFin', '');
    }
  };

  // Obtener icono según tipo de movimiento
  const obtenerIconoMovimiento = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      case 'salida':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
      case 'ajuste':
        return <SettingOutlined style={{ color: '#1890ff' }} />;
      default:
        return <SettingOutlined />;
    }
  };

  // Obtener origen del movimiento
  const obtenerOrigenMovimiento = (record) => {
    if (record.compra) return { tipo: 'Compra', numero: record.compra.numeroCompra, icon: <ShoppingOutlined />, color: 'blue' };
    if (record.venta) return { tipo: 'Venta', numero: record.venta.numeroFactura, icon: <PayCircleOutlined />, color: 'green' };
    if (record.ajuste) return { tipo: 'Ajuste', numero: record.ajuste.numeroAjuste, icon: <SettingOutlined />, color: 'orange' };
    return { tipo: 'Manual', numero: '-', icon: <SettingOutlined />, color: 'default' };
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fechaMovimiento',
      key: 'fechaMovimiento',
      render: (fecha) => <span className="text-gray-900 dark:text-white">{dayjs(fecha).format('DD/MM/YYYY HH:mm')}</span>,
      sorter: true,
      width: 150,
    },
    {
      title: 'Producto',
      key: 'producto',
      render: (_, record) => (
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{record.variante.producto.nombreProducto}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {record.variante.color?.nombreColor} - {record.variante.talla?.nombreTalla}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            SKU: {record.variante.codigoSku}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Tipo',
      key: 'tipo',
      render: (_, record) => (
        <Tag color={
          record.tipoMovimiento.tipo === 'entrada' ? 'green' :
          record.tipoMovimiento.tipo === 'salida' ? 'red' : 'blue'
        }>
          {obtenerIconoMovimiento(record.tipoMovimiento.tipo)}
          <span style={{ marginLeft: '4px' }}>{record.tipoMovimiento.nombreTipo}</span>
        </Tag>
      ),
      filters: [
        { text: 'Entrada', value: 'entrada' },
        { text: 'Salida', value: 'salida' },
        { text: 'Ajuste', value: 'ajuste' },
      ],
      onFilter: (value, record) => record.tipoMovimiento.tipo === value,
      width: 150,
    },
    {
      title: 'Origen',
      key: 'origen',
      render: (_, record) => {
        const origen = obtenerOrigenMovimiento(record);
        return (
          <Tag color={origen.color}>
            {origen.icon}
            <span style={{ marginLeft: '4px' }}>{origen.tipo} {origen.numero}</span>
          </Tag>
        );
      },
      filters: [
        { text: 'Compra', value: 'compra' },
        { text: 'Venta', value: 'venta' },
        { text: 'Ajuste', value: 'ajuste' },
        { text: 'Manual', value: 'manual' },
      ],
      onFilter: (value, record) => {
        const origen = obtenerOrigenMovimiento(record);
        return origen.tipo.toLowerCase() === value;
      },
      width: 150,
    },
    {
      title: 'Usuario',
      dataIndex: ['usuarioRegistroRef', 'usuario'],
      key: 'usuario',
      render: (usuario) => <span className="text-gray-900 dark:text-white">{usuario || 'Sistema'}</span>,
      width: 120,
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400">Antes: {record.stockAnterior}</div>
          <div className="font-bold text-sm text-gray-900 dark:text-white">
            {record.cantidad > 0 ? '+' : ''}{record.cantidad}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Después: {record.stockNuevo}</div>
        </div>
      ),
      width: 100,
    },
    {
      title: 'Motivo',
      dataIndex: 'motivo',
      key: 'motivo',
      ellipsis: true,
      render: (motivo) => <span className="text-gray-900 dark:text-white">{motivo}</span>,
      width: 200,
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Movimientos de Inventario</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historial completo de movimientos de stock
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 mb-6">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="Buscar por producto..."
              prefix={<SearchOutlined className="text-gray-400 dark:text-gray-500" />}
              value={filtros.search}
              onChange={(e) => handleFiltroChange('search', e.target.value)}
              allowClear
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['Fecha inicio', 'Fecha fin']}
              value={
                filtros.fechaInicio && filtros.fechaFin
                  ? [dayjs(filtros.fechaInicio), dayjs(filtros.fechaFin)]
                  : null
              }
              onChange={handleFechaChange}
              style={{ width: '100%' }}
              className="dark:[&_.ant-picker]:bg-slate-700 dark:[&_.ant-picker]:border-slate-600 dark:[&_.ant-picker]:text-white"
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Tipo de movimiento"
              style={{ width: '100%' }}
              allowClear
              value={filtros.idTipoMovimiento || undefined}
              onChange={(value) => handleFiltroChange('idTipoMovimiento', value)}
              className="dark:bg-slate-700 dark:[&_.ant-select-selector]:border-slate-600 dark:[&_.ant-select-selector]:bg-slate-700 dark:[&_.ant-select-selector]:text-white"
            >
              {tiposMovimiento.map(tipo => (
                <Option key={tipo.idTipoMovimiento} value={tipo.idTipoMovimiento.toString()}>
                  {tipo.nombreTipo}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button
              onClick={() => setFiltros({
                pagina: 1,
                limite: 20,
                search: '',
                idVariante: '',
                idTipoMovimiento: '',
                fechaInicio: '',
                fechaFin: '',
              })}
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 dark:bg-slate-800 hover:dark:bg-slate-700"
            >
              Limpiar Filtros
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla de movimientos */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <Table
          columns={columns}
          dataSource={movimientos.datos || []}
          rowKey="idMovimiento"
          pagination={{
            current: movimientos.paginacion?.paginaActual || 1,
            pageSize: movimientos.paginacion?.registrosPorPagina || 20,
            total: movimientos.paginacion?.totalRegistros || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} movimientos`,
            onChange: (page, pageSize) => {
              setFiltros(prev => ({
                ...prev,
                pagina: page,
                limite: pageSize
              }));
            },
          }}
          scroll={{ x: 1200 }}
          className="[&_.ant-table]:bg-transparent dark:[&_.ant-table]:bg-transparent"
          rowClassName={() => 'dark:border-slate-700 hover:dark:bg-slate-700'}
        />
      </div>
    </div>
  );
};

export default MovimientosInventarioPage;