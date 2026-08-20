import React from 'react';
import { ReloadOutlined } from '@ant-design/icons';

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const MetricasDashboard = ({ metricas = {}, onActualizar }) => {
  const totalCompras = Number(metricas.totalCompras || 0);
  const totalGastado = Number(metricas.totalGastado || 0);
  const promedio = totalCompras > 0 ? totalGastado / totalCompras : 0;

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Resumen de compras</h3>
        {onActualizar ? (
          <button
            type="button"
            onClick={onActualizar}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
          >
            <ReloadOutlined />
            Actualizar
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <article className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Compras</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{totalCompras}</p>
        </article>
        <article className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Gastado</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatMoney(totalGastado)}</p>
        </article>
        <article className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Promedio</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatMoney(promedio)}</p>
        </article>
        <article className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Ultima compra</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {metricas.ultimaCompra
              ? new Date(metricas.ultimaCompra).toLocaleDateString('es-CO')
              : 'Sin datos'}
          </p>
        </article>
      </div>
    </section>
  );
};

export default MetricasDashboard;
