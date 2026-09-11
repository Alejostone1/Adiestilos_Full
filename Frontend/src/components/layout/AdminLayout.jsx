import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Columna de contenido: la barra móvil queda fuera del área con scroll,
          así siempre se ve completa y nunca se traslapa con la página. */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-tertiary text-white shadow-md active:scale-95 transition-transform shrink-0"
          >
            {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <span className="font-headline-sm font-semibold text-primary truncate">Adi Estilos</span>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
