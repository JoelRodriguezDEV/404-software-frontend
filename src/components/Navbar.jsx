/*eslint-disable*/
import React, { useState } from "react";
import {
  Download,
  Package,
  Menu,
  X,
  LayoutDashboard,
  Bed,
  LogOut,
  User, // 👈 1. Importamos el icono de Usuario
} from "lucide-react";
import logo404 from "../assets/logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const Navbar = ({
  onGoToInventory,
  onGoToDashboard,
  onGoToRooms,
  onGoToProfile, // 👈 2. Recibimos la función para navegar al perfil
  currentPage,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función segura para descargar el reporte con Token
  const handleDownloadReport = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/financial`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Acceso denegado");

      const blob = await res.blob();
      const fileURL = URL.createObjectURL(blob);

      window.open(fileURL, "_blank");
    } catch (error) {
      alert("Error: No tienes autorización para ver este reporte.");
    }
  };

  return (
    <nav className="border-b border-gray-800 bg-[#090910]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* LOGO Y NAVEGACIÓN PRINCIPAL */}
        <div className="flex items-center gap-8">
          <div className="cursor-pointer" onClick={onGoToDashboard}>
            {logo404 ? (
              <img
                src={logo404}
                alt="404 Logo"
                className="h-10 w-auto object-contain hover:brightness-125 transition-all"
              />
            ) : (
              <span className="text-2xl font-black text-white tracking-tighter">
                404<span className="text-[#F941A9]">.</span>
              </span>
            )}
          </div>

          {/* LINKS DE ESCRITORIO */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={onGoToDashboard}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                currentPage === "dashboard"
                  ? "text-[#F941A9]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
            <button
              onClick={onGoToInventory}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                currentPage === "inventory"
                  ? "text-[#00E5FF]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Package size={16} />
              Inventario
            </button>
            <button
              onClick={onGoToRooms}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                currentPage === "rooms"
                  ? "text-[#00E5FF]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Bed size={16} />
              Habitaciones
            </button>
          </div>
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="hidden md:flex items-center gap-2 bg-[#1A1A24] hover:bg-[#F941A9] text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all text-sm font-medium border border-gray-700 hover:border-[#F941A9] hover:shadow-[0_0_15px_rgba(249,65,169,0.4)]"
          >
            <Download size={16} />
            <span>Reporte Mensual</span>
          </button>

          {/* 👇 3. REEMPLAZADO: Botón de Perfil en lugar de Logout (Desktop) */}
          <button
            onClick={() => onGoToProfile()}
            className="hidden md:flex items-center justify-center p-2 text-gray-500 hover:text-[#F941A9] hover:bg-[#F941A9]/10 rounded-lg transition-all"
            title="Mi Perfil y Auditoría"
          >
            <User size={20} />
          </button>

          {/* BOTÓN MÓVIL */}
          <button
            className="md:hidden text-gray-400 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#13131F] border-b border-gray-800 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          <button
            onClick={() => {
              onGoToDashboard();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 text-gray-300 font-bold py-2 border-b border-gray-800/50"
          >
            <LayoutDashboard size={18} /> DASHBOARD
          </button>
          <button
            onClick={() => {
              onGoToInventory();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 text-gray-300 font-bold py-2 border-b border-gray-800/50"
          >
            <Package size={18} /> INVENTARIO
          </button>
          <button
            onClick={() => {
              onGoToRooms();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 text-gray-300 font-bold py-2 border-b border-gray-800/50"
          >
            <Bed size={18} /> HABITACIONES
          </button>

          <button
            onClick={handleDownloadReport}
            className="w-full flex items-center justify-center gap-2 bg-[#F941A9] text-white py-3 rounded-lg font-bold"
          >
            <Download size={18} /> REPORTE MENSUAL
          </button>

          {/* 👇 4. REEMPLAZADO: Botón de Perfil en lugar de Logout (Móvil) */}
          <button
            onClick={() => {
              onGoToProfile();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#F941A9]/10 text-[#F941A9] border border-[#F941A9]/20 py-3 rounded-lg font-bold mt-2"
          >
            <User size={18} /> MI PERFIL Y AUDITORÍA
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
