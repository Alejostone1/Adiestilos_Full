import React from 'react';

/**
 * Layout base para páginas del panel administrativo
 * Soporta:
 * - Título, icono y descripción
 * - Acciones rápidas
 * - Control por roles
 * - Estado "en construcción"
 * - Modo oscuro
 */
const AdminPageLayout = ({
  title,
  icon,
  description,
  actions,
  children,
  isEnabled = true,
  requiredRoles = [],
  userRole = null
}) => {

  // ---------------------------
  // Validación de roles
  // ---------------------------
  const tienePermiso =
    requiredRoles.length === 0 || requiredRoles.includes(userRole);

  if (!tienePermiso) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600">
          Acceso restringido
        </h1>
        <p className="text-gray-500 mt-2">
          No tienes permisos para acceder a este módulo.
        </p>
      </div>
    );
  }

  // ---------------------------
  // Módulo deshabilitado
  // ---------------------------
  if (!isEnabled) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {title}
        </h1>
        <p className="text-gray-500">
          🚧 Módulo en construcción. Próximamente disponible.
        </p>
      </div>
    );
  }

  // ---------------------------
  // Layout completo
  // ---------------------------
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-3xl">{icon}</span>}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Acciones */}
        {actions && (
          <div className="flex gap-2 mt-4 md:mt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
        {children}
      </div>
    </div>
  );
};

// Componente placeholder simple para páginas en construcción
const AdminPagePlaceholder = ({ title }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">Esta página está siendo desarrollada y estará disponible próximamente.</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>🚧 En construcción</p>
          <p>📋 Próximamente disponible</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPagePlaceholder;
export { AdminPageLayout };
