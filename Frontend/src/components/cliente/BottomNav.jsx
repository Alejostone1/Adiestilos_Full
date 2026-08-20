import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      key: '/cliente/dashboard',
      icon: <HomeOutlined />,
      label: 'Inicio',
    },
    {
      key: '/cliente/compras',
      icon: <ShoppingOutlined />,
      label: 'Tienda',
    },
    {
      key: '/cliente/carrito',
      icon: <ShoppingCartOutlined />,
      label: 'Carrito',
    },
    {
      key: '/cliente/pedidos',
      icon: <FileTextOutlined />,
      label: 'Pedidos',
    },
    {
      key: '/cliente/perfil',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
              isActive(item.key)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
