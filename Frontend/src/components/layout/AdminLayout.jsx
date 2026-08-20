import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
