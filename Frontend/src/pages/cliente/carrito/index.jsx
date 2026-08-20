import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import { useCarrito } from '../../../context/CarritoContext';
import { ventasApi } from '../../../api/ventasApi';

const TAX_RATE = 0.19;

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const CarritoPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { carrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } = useCarrito();

  const [loading, setLoading] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState(usuario?.direccion || '');

  useEffect(() => {
    setDireccionEntrega(usuario?.direccion || '');
  }, [usuario?.direccion]);

  const subtotal = useMemo(
    () =>
      carrito.reduce((acc, item) => {
        const precio = Number(item.precio ?? item.precioVenta ?? 0);
        return acc + precio * item.cantidad;
      }, 0),
    [carrito]
  );
  const impuestos = subtotal * TAX_RATE;
  const total = subtotal + impuestos;

  const procesarCompra = async () => {
    try {
      if (!usuario?.idUsuario) {
        message.error('Debes iniciar sesion');
        return;
      }
      if (!carrito.length) {
        message.warning('Tu carrito esta vacio');
        return;
      }
      if (!direccionEntrega.trim()) {
        message.warning('Ingresa una direccion de entrega');
        return;
      }

      setLoading(true);

      const ventaData = {
        idUsuario: usuario.idUsuario,
        idEstadoPedido: 1,
        direccionEntrega: direccionEntrega.trim(),
        tipoVenta: 'contado',
        subtotal: Number(subtotal.toFixed(2)),
        impuestos: Number(impuestos.toFixed(2)),
        total: Number(total.toFixed(2)),
        detalleVentas: carrito.map((item) => {
          const precio = Number(item.precio ?? item.precioVenta ?? 0);
          const subtotalLinea = Number((precio * item.cantidad).toFixed(2));
          return {
            idVariante: item.idVariante,
            cantidad: item.cantidad,
            precioUnitario: precio,
            subtotal: subtotalLinea,
            totalLinea: subtotalLinea,
          };
        }),
      };

      const respuesta = await ventasApi.createVenta(ventaData);

      await Swal.fire({
        icon: 'success',
        title: 'Compra realizada',
        text: `Tu orden ${respuesta?.data?.numeroFactura ? `#${respuesta.data.numeroFactura}` : ''} fue registrada correctamente.`,
        confirmButtonText: 'Ver mis pedidos',
      });

      limpiarCarrito();
      navigate('/cliente/pedidos');
    } catch (error) {
      message.error(error?.mensaje || 'No se pudo procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Tu carrito esta vacio</p>
          <p className="mt-2 text-sm text-gray-600">Agrega productos para continuar con tu compra.</p>
          <button
            type="button"
            onClick={() => navigate('/cliente/compras')}
            className="mt-5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Ir a tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/cliente/compras')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
        >
          <ArrowLeftOutlined />
          Seguir comprando
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            {carrito.map((item) => {
              const precio = Number(item.precio ?? item.precioVenta ?? 0);
              const subtotalLinea = precio * item.cantidad;
              const color = item.nombreColor || item.color;
              const talla = item.nombreTalla || item.talla;
              const max = Number(item.stockDisponible || 999);
              return (
                <article key={item.idVariante} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <img
                      src={item.imagen || '/placeholder.png'}
                      alt={item.nombreProducto}
                      className="h-24 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 md:text-base">{item.nombreProducto}</h3>
                      <p className="mt-1 text-xs text-gray-500">{[color, talla].filter(Boolean).join(' - ') || 'Sin variante'}</p>
                      <p className="mt-2 text-sm font-medium text-gray-700">{formatMoney(precio)}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(item.idVariante, item.cantidad - 1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                          >
                            <MinusOutlined />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => actualizarCantidad(item.idVariante, Math.min(item.cantidad + 1, max))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                          >
                            <PlusOutlined />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.idVariante)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-500"
                          aria-label="Eliminar producto"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatMoney(subtotalLinea)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>

            <label htmlFor="direccion" className="mt-4 block text-sm font-medium text-gray-700">
              Direccion de entrega
            </label>
            <textarea
              id="direccion"
              rows={3}
              value={direccionEntrega}
              onChange={(event) => setDireccionEntrega(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
              placeholder="Ingresa tu direccion completa"
            />

            <div className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Impuestos (19%)</span>
                <span>{formatMoney(impuestos)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={procesarCompra}
              disabled={loading}
              className="mt-4 h-12 w-full rounded-2xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? 'Procesando...' : 'Confirmar compra'}
            </button>
            <button
              type="button"
              onClick={limpiarCarrito}
              className="mt-2 h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700"
            >
              Vaciar carrito
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;
