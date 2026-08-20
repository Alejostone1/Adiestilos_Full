import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

/**
 * Componente Badge para mostrar el estado de una devolución
 * @param {string} estado - Estado de la devolución ('pendiente', 'aprobada', 'rechazada', 'procesada')
 * @param {string} size - Tamaño del badge ('sm', 'md', 'lg')
 * @returns {JSX.Element} Badge con el estado correspondiente
 */
const DevolucionEstadosBadge = ({ estado, size = 'md' }) => {
  // Configuración de estados
  const configuracionEstados = {
    pendiente: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icono: Clock,
      texto: 'Pendiente',
      descripcion: 'Esperando aprobación'
    },
    aprobada: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icono: CheckCircle,
      texto: 'Aprobada',
      descripcion: 'Aprobada para procesamiento'
    },
    rechazada: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icono: XCircle,
      texto: 'Rechazada',
      descripcion: 'Devolución rechazada'
    },
    procesada: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icono: CheckCircle,
      texto: 'Procesada',
      descripcion: 'Devolución completada'
    }
  };

  // Configuración de tamaños
  const configuracionTamanos = {
    sm: {
      contenedor: 'px-2 py-1 text-xs',
      icono: 'w-3 h-3'
    },
    md: {
      contenedor: 'px-3 py-1.5 text-sm',
      icono: 'w-4 h-4'
    },
    lg: {
      contenedor: 'px-4 py-2 text-base',
      icono: 'w-5 h-5'
    }
  };

  const config = configuracionEstados[estado] || configuracionEstados.pendiente;
  const tamano = configuracionTamanos[size] || configuracionTamanos.md;
  const Icono = config.icono;

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full font-medium ${config.color} ${tamano.contenedor}`}>
      <Icono className={tamano.icono} />
      <span>{config.texto}</span>
    </div>
  );
};

export default DevolucionEstadosBadge;
