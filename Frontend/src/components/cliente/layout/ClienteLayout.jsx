import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Space,
  Typography,
  Drawer,
  theme
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import CarritoIcon from '../carrito/CarritoIcon';
import BottomNav from '../BottomNav';

// Componentes UI personalizados

const ClienteLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { token } = theme.useToken();
  const { Text } = Typography;

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      key: '/cliente/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/cliente/compras',
      icon: <ShoppingOutlined />,
      label: 'Tienda',
    },
    {
      key: '/cliente/carrito',
      icon: <ShoppingCartOutlined />,
      label: 'Mi Carrito',
    },
    {
      key: '/cliente/pedidos',
      icon: <ShoppingCartOutlined />,
      label: 'Mis Pedidos',
    },
    {
      key: '/cliente/perfil',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
    },
  ];

  const userMenuItems = [
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/cliente/perfil'),
    },
    {
      key: 'configuracion',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/cliente/configuracion'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: logout,
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const getSelectedKey = () => {
    return location.pathname;
  };

  const HeaderContent = () => (
    <div className="cliente-header">
      <div className="header-left">
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            className="mobile-menu-btn"
          />
        )}
        
        <div className="header-logo">
          <h2 className="logo-text">AD Estilos</h2>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => navigate('/cliente/compras')}
            className="search-btn"
          >
            Buscar productos...
          </Button>
        </div>
      </div>

      <div className="header-right">
        <Space size="middle">
          <Badge count={0} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="header-icon-btn"
            />
          </Badge>
          
          <CarritoIcon />
          
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="user-avatar-container">
              <Avatar
                size="small"
                icon={<UserOutlined />}
                className="user-avatar"
              />
              {!isMobile && (
                <Text className="user-name">
                  {usuario?.nombres?.split(' ')[0]}
                </Text>
              )}
            </div>
          </Dropdown>
        </Space>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="cliente-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h3 className="sidebar-logo-text">
            {collapsed ? 'AD' : 'AD Estilos'}
          </h3>
        </div>
      </div>
      
      <div className="sidebar-user">
        <Avatar
          size={collapsed ? 32 : 40}
          icon={<UserOutlined />}
          className="sidebar-avatar"
        />
        {!collapsed && (
          <div className="sidebar-user-info">
            <Text strong>{usuario?.nombres} {usuario?.apellidos}</Text>
            <Text type="secondary" className="user-role">Cliente</Text>
          </div>
        )}
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      {isMobile ? (
        <>
          {/* Header móvil */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="text-gray-600"
              />

              <h1 className="text-lg font-semibold text-gray-900">AD Estilos</h1>

              <div className="flex items-center gap-2">
                <Badge count={0} size="small">
                  <Button type="text" icon={<BellOutlined />} className="text-gray-600" />
                </Badge>
                <CarritoIcon />
              </div>
            </div>
          </div>

          <Drawer
            title="Menú"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            styles={{ body: { padding: 0 } }}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <Avatar size={48} icon={<UserOutlined />} className="bg-blue-500" />
                <div>
                  <div className="font-semibold">{usuario?.nombres} {usuario?.apellidos}</div>
                  <div className="text-sm text-gray-500">Cliente</div>
                </div>
              </div>

              <Menu
                theme="light"
                mode="inline"
                selectedKeys={[getSelectedKey()]}
                items={menuItems}
                onClick={handleMenuClick}
                className="border-none"
              />

              <div className="mt-6 pt-4 border-t">
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={logout}
                  className="w-full justify-start text-red-600"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </Drawer>
        </>
      ) : (
        <>
          {/* Sidebar desktop */}
          <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
            collapsed ? 'w-16' : 'w-64'
          }`}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <Avatar size={collapsed ? 32 : 48} icon={<UserOutlined />} className="bg-blue-500" />
                {!collapsed && (
                  <div>
                    <div className="font-semibold">{usuario?.nombres} {usuario?.apellidos}</div>
                    <div className="text-sm text-gray-500">Cliente</div>
                  </div>
                )}
              </div>

              <Menu
                theme="light"
                mode="inline"
                selectedKeys={[getSelectedKey()]}
                items={menuItems}
                onClick={handleMenuClick}
                inlineCollapsed={collapsed}
                className="border-none"
              />
            </div>
          </div>

          {/* Header desktop */}
          <div className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 transition-all duration-300 ${
            collapsed ? 'left-16' : 'left-64'
          }`}>
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-gray-600"
                />
                <h1 className="text-xl font-semibold text-gray-900">AD Estilos</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>

                <Badge count={0} size="small">
                  <Button type="text" icon={<BellOutlined />} className="text-gray-600" />
                </Badge>

                <CarritoIcon />

                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
                    <span className="text-sm">{usuario?.nombres?.split(' ')[0]}</span>
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className={`transition-all duration-300 ${isMobile ? 'pt-0' : collapsed ? 'ml-16 mt-16' : 'ml-64 mt-16'}`}>
        <div className="min-h-screen">
          <Outlet />
        </div>

        {/* Bottom Navigation móvil */}
        {isMobile && <BottomNav />}
      </div>
    </Layout>
  );
};

export default ClienteLayout;
