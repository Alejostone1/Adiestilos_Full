import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  message,
  Avatar,
  Row,
  Col,
  Modal,
  Spin
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  EditOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { usuariosApi } from '../../../api/usuariosApi';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

const PerfilPage = () => {
  const { usuario, login } = useAuth();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  useEffect(() => {
    if (usuario) {
      form.setFieldsValue({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correoElectronico: usuario.correoElectronico,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || ''
      });
    }
  }, [usuario, form]);

  const handleGuardar = async (values) => {
    if (!usuario) {
      message.error('Session expirada');
      return;
    }

    try {
      setSavingLoading(true);

      const payload = {
        nombres: values.nombres,
        apellidos: values.apellidos,
        telefono: values.telefono || null,
        direccion: values.direccion || null
      };

      // Actualizar en backend
      const usuarioActualizado = await usuariosApi.updateUsuario(usuario.idUsuario, payload);

      // Actualizar contexto con nuevo usuario
      login({
        tokenAcceso: localStorage.getItem('token'),
        usuario: usuarioActualizado || { ...usuario, ...values }
      });

      setEditing(false);
      message.success('Perfil actualizado correctamente');

    } catch (error) {
      console.error('Error al actualizar:', error);
      message.error(error?.mensaje || 'Error al actualizar el perfil');
    } finally {
      setSavingLoading(false);
    }
  };

  const handleCancelar = () => {
    form.resetFields();
    setEditing(false);
  };

  if (loading && !usuario) {
    return (
      <div className="perfil-loading">
        <Spin size="large" />
        <Text>Cargando perfil...</Text>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="perfil-error">
        <Text type="danger">No se puede cargar el perfil</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <ClienteSection>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal</p>
        </div>
      </ClienteSection>

      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Avatar y Info Básica */}
        <ClienteCard>
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
              <button
                onClick={() => message.info('Funcionalidad en desarrollo')}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
              >
                <CameraOutlined className="text-sm" />
              </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {usuario.nombres} {usuario.apellidos}
            </h2>
            <p className="text-gray-600 mb-4">Cliente ADI Estilos</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID Usuario</span>
                <p className="font-medium">#{usuario.idUsuario}</p>
              </div>
              <div>
                <span className="text-gray-500">Estado</span>
                <p className="font-medium text-green-600">{usuario.estado}</p>
              </div>
              <div>
                <span className="text-gray-500">Miembro desde</span>
                <p className="font-medium">
                  {new Date(usuario.creadoEn).toLocaleDateString('es-CO')}
                </p>
              </div>
              {usuario.ultimaConexion && (
                <div>
                  <span className="text-gray-500">Última conexión</span>
                  <p className="font-medium">
                    {new Date(usuario.ultimaConexion).toLocaleDateString('es-CO')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ClienteCard>

        {/* Formulario de Edición */}
        <ClienteCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            {!editing && (
              <ClienteButton onClick={() => setEditing(true)}>
                <EditOutlined className="mr-2" />
                Editar
              </ClienteButton>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleGuardar}
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  label="Nombres"
                  name="nombres"
                  rules={[
                    { required: true, message: 'Por favor ingresa tus nombres' },
                    { min: 2, message: 'Mínimo 2 caracteres' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Tus nombres"
                    disabled={!editing}
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item
                  label="Apellidos"
                  name="apellidos"
                  rules={[
                    { required: true, message: 'Por favor ingresa tus apellidos' },
                    { min: 2, message: 'Mínimo 2 caracteres' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Tus apellidos"
                    disabled={!editing}
                    className="h-12"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Correo Electrónico"
                name="correoElectronico"
                rules={[
                  { required: true, message: 'Por favor ingresa tu correo' },
                  { type: 'email', message: 'Correo inválido' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="tu@email.com"
                  disabled={true}
                  className="h-12"
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  label="Teléfono"
                  name="telefono"
                  rules={[
                    {
                      pattern: /^[0-9+\-\s()]*$/,
                      message: 'Teléfono inválido'
                    }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+57 123 456 7890"
                    disabled={!editing}
                    className="h-12"
                  />
                </Form.Item>

                <Form.Item label="Rol">
                  <Input
                    value={usuario.rol?.nombreRol || 'Cliente'}
                    disabled
                    className="h-12"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Dirección"
                name="direccion"
                rules={[
                  {
                    max: 255,
                    message: 'Máximo 255 caracteres'
                  }
                ]}
              >
                <Input.TextArea
                  prefix={<EnvironmentOutlined />}
                  placeholder="Tu dirección completa"
                  rows={4}
                  disabled={!editing}
                />
              </Form.Item>

              {editing && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <ClienteButton
                    type="submit"
                    loading={savingLoading}
                    className="flex-1"
                  >
                    <SaveOutlined className="mr-2" />
                    Guardar Cambios
                  </ClienteButton>
                  <ClienteButton
                    variant="outline"
                    onClick={handleCancelar}
                    className="flex-1"
                  >
                    Cancelar
                  </ClienteButton>
                </div>
              )}
            </div>
          </Form>

          {!editing && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Teléfono</span>
                  <p className="font-medium">{usuario.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Dirección</span>
                  <p className="font-medium">{usuario.direccion || 'No especificada'}</p>
                </div>
              </div>
            </div>
          )}
        </ClienteCard>

        {/* Opciones Adicionales */}
        <div className="grid grid-cols-1 gap-4">
          <ClienteCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MailOutlined className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Notificaciones</h4>
                <p className="text-sm text-gray-600">Gestiona cómo quieres recibir actualizaciones</p>
              </div>
              <ClienteButton variant="outline">
                Configurar
              </ClienteButton>
            </div>
          </ClienteCard>

          <ClienteCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <UserOutlined className="text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Seguridad</h4>
                <p className="text-sm text-gray-600">Cambia tu contraseña y configuración</p>
              </div>
              <ClienteButton variant="outline">
                Configurar
              </ClienteButton>
            </div>
          </ClienteCard>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;