import React, { useState, useEffect } from 'react';
import {
  obtenerTodosLosTiposMovimiento,
  crearTipoMovimiento,
  actualizarTipoMovimiento,
  desactivarTipoMovimiento
} from '../../../api/tiposMovimientoApi';
import { Button, Table, Switch, Modal, Form, Input, Select, message, Spin, Space, Tag } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const TiposMovimientoPage = () => {
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [form] = Form.useForm();

  // Cargar tipos de movimiento
  const cargarTiposMovimiento = async () => {
    try {
      setLoading(true);
      const response = await obtenerTodosLosTiposMovimiento();
      // La respuesta viene en response.datos.datos debido a la estructura del backend
      const tiposData = response.datos?.datos || [];
      setTiposMovimiento(tiposData);
    } catch (error) {
      message.error('Error al cargar tipos de movimiento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTiposMovimiento();
  }, []);

  // Abrir modal para crear/editar
  const abrirModal = (tipo = null) => {
    setEditingTipo(tipo);
    if (tipo) {
      form.setFieldsValue(tipo);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalVisible(false);
    setEditingTipo(null);
    form.resetFields();
  };

  // Guardar tipo de movimiento
  const guardarTipoMovimiento = async (values) => {
    try {
      if (editingTipo) {
        await actualizarTipoMovimiento(editingTipo.idTipoMovimiento, values);
        message.success('Tipo de movimiento actualizado exitosamente');
      } else {
        await crearTipoMovimiento(values);
        message.success('Tipo de movimiento creado exitosamente');
      }
      cerrarModal();
      cargarTiposMovimiento();
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al guardar tipo de movimiento');
    }
  };

  // Desactivar tipo de movimiento
  const handleDesactivar = async (idTipoMovimiento) => {
    try {
      await desactivarTipoMovimiento(idTipoMovimiento);
      message.success('Tipo de movimiento desactivado exitosamente');
      cargarTiposMovimiento();
    } catch (error) {
      message.error('Error al desactivar tipo de movimiento');
    }
  };

  // Cambiar estado activo/inactivo
  const cambiarEstado = async (checked, record) => {
    try {
      await actualizarTipoMovimiento(record.idTipoMovimiento, {
        ...record,
        activo: checked
      });
      message.success(`Tipo de movimiento ${checked ? 'activado' : 'desactivado'} exitosamente`);
      cargarTiposMovimiento();
    } catch (error) {
      message.error('Error al cambiar estado');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombreTipo',
      key: 'nombreTipo',
      sorter: (a, b) => a.nombreTipo.localeCompare(b.nombreTipo),
      render: (text) => <span className="text-gray-900 dark:text-white">{text}</span>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => (
        <Tag color={
          tipo === 'entrada' ? 'green' :
          tipo === 'salida' ? 'red' :
          'blue'
        }>
          {tipo === 'entrada' ? 'Entrada' :
           tipo === 'salida' ? 'Salida' :
           'Ajuste'}
        </Tag>
      ),
      filters: [
        { text: 'Entrada', value: 'entrada' },
        { text: 'Salida', value: 'salida' },
        { text: 'Ajuste', value: 'ajuste' },
      ],
      onFilter: (value, record) => record.tipo === value,
    },
    {
      title: 'Afecta Costo',
      dataIndex: 'afectaCosto',
      key: 'afectaCosto',
      render: (afectaCosto) => <span className="text-gray-900 dark:text-white">{afectaCosto ? 'Sí' : 'No'}</span>,
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo, record) => (
        <Switch
          checked={activo}
          onChange={(checked) => cambiarEstado(checked, record)}
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
        />
      ),
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.activo === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => abrirModal(record)}
            className="dark:text-blue-400 hover:dark:text-blue-300"
          >
            Editar
          </Button>
          {record.activo && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDesactivar(record.idTipoMovimiento)}
              className="dark:text-red-400 hover:dark:text-red-300"
            >
              Desactivar
            </Button>
          )}
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Tipos de Movimiento</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los tipos de movimientos de inventario del sistema
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => abrirModal()}
          className="dark:bg-blue-600 dark:border-blue-600"
        >
          Nuevo Tipo
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <Table
          columns={columns}
          dataSource={tiposMovimiento}
          rowKey="idTipoMovimiento"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} tipos`,
          }}
          className="[&_.ant-table]:bg-transparent dark:[&_.ant-table]:bg-transparent"
          rowClassName={() => 'dark:border-slate-700 hover:dark:bg-slate-700'}
        />
      </div>

      {/* Modal para crear/editar */}
      <Modal
        title={editingTipo ? 'Editar Tipo de Movimiento' : 'Crear Tipo de Movimiento'}
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        width={600}
        className="dark:[&_.ant-modal-content]:bg-slate-800 dark:[&_.ant-modal-header]:border-slate-700 dark:[&_.ant-modal-header]:bg-slate-800 dark:[&_.ant-modal-title]:text-white"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={guardarTipoMovimiento}
        >
          <Form.Item
            name="nombreTipo"
            label={<span className="text-gray-900 dark:text-white">Nombre del Tipo</span>}
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input 
              placeholder="Ej: Compra, Venta, Ajuste Manual"
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </Form.Item>

          <Form.Item
            name="tipo"
            label={<span className="text-gray-900 dark:text-white">Tipo de Movimiento</span>}
            rules={[{ required: true, message: 'El tipo es obligatorio' }]}
          >
            <Select 
              placeholder="Selecciona el tipo"
              className="dark:bg-slate-700 dark:[&_.ant-select-selector]:border-slate-600 dark:[&_.ant-select-selector]:bg-slate-700 dark:[&_.ant-select-selector]:text-white"
            >
              <Option value="entrada">Entrada</Option>
              <Option value="salida">Salida</Option>
              <Option value="ajuste">Ajuste</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="afectaCosto"
            label={<span className="text-gray-900 dark:text-white">¿Afecta el costo?</span>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label={<span className="text-gray-900 dark:text-white">Descripción (opcional)</span>}
          >
            <Input.TextArea
              placeholder="Describe el propósito de este tipo de movimiento"
              rows={3}
              className="border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-500"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={cerrarModal} className="dark:text-gray-300 dark:border-slate-600 dark:bg-slate-700 hover:dark:bg-slate-600">
                Cancelar
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="dark:bg-blue-600 dark:border-blue-600"
              >
                {editingTipo ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TiposMovimientoPage;