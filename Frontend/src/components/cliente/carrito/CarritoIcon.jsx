import React, { useState } from 'react';
import { Badge, Button, Drawer, Empty, message } from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCarrito } from '../../../context/CarritoContext';

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const CarritoIcon = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const {
    carrito,
    getTotalItems,
    getTotalPrice,
    actualizarCantidad,
    eliminarDelCarrito,
    limpiarCarrito,
  } = useCarrito();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleOpenDrawer = () => {
    if (!usuario) {
      message.info('Inicia sesion para usar el carrito');
      navigate('/login');
      return;
    }
    setDrawerVisible(true);
  };

  const handleQuantityChange = (idVariante, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(idVariante);
      return;
    }
    actualizarCantidad(idVariante, nuevaCantidad);
  };

  return (
    <>
      <Button
        type="text"
        aria-label="Abrir carrito"
        icon={
          <Badge count={totalItems} size="small" offset={[-6, 6]}>
            <ShoppingCartOutlined className="text-lg text-gray-700" />
          </Badge>
        }
        onClick={handleOpenDrawer}
        className="!h-10 !w-10"
      />

      <Drawer
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        title={null}
      >
        <div className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Mi carrito</h3>
            {carrito.length > 0 ? (
              <button
                type="button"
                onClick={limpiarCarrito}
                className="text-sm font-medium text-red-500"
              >
                Vaciar
              </button>
            ) : null}
          </div>

          {carrito.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <Empty description="Tu carrito esta vacio" />
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {carrito.map((item) => {
                  const precio = Number(item.precio ?? item.precioVenta ?? 0);
                  const subtotal = precio * item.cantidad;
                  return (
                    <article key={item.idVariante} className="rounded-2xl border border-gray-100 p-3 shadow-sm">
                      <div className="flex gap-3">
                        <img
                          src={item.imagen || '/placeholder.png'}
                          alt={item.nombreProducto}
                          className="h-20 w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 space-y-2">
                          <p className="line-clamp-1 text-sm font-semibold text-gray-900">{item.nombreProducto}</p>
                          <p className="text-xs text-gray-500">
                            {[item.nombreColor || item.color, item.nombreTalla || item.talla].filter(Boolean).join(' - ') || 'Sin variante'}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.idVariante, item.cantidad - 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200"
                              >
                                <MinusOutlined />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{item.cantidad}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.idVariante, item.cantidad + 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200"
                              >
                                <PlusOutlined />
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{formatMoney(subtotal)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.idVariante)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <footer className="mt-4 rounded-2xl border border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Productos ({totalItems})</span>
                  <span className="font-semibold text-gray-900">{formatMoney(totalPrice)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerVisible(false);
                    navigate('/cliente/carrito');
                  }}
                  className="h-11 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
                >
                  Ir al checkout
                </button>
              </footer>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default CarritoIcon;
