/*eslint-disable*/
import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  ArrowLeft,
  Terminal,
  PlusCircle,
  Shield,
  Clock,
} from "lucide-react";

// 🔧 CONFIGURACIÓN: Asegúrate de que apunte a tu puerto de backend
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const Profile = ({ onBack, onLogout }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {
      username: "Admin",
      role: "ADMIN",
    },
  );

  // 👇 NUEVOS ESTADOS PARA CREAR USUARIO
  const [newOperator, setNewOperator] = useState({
    username: "",
    password: "",
    role: "RECEPTIONIST",
  });
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Solo cargamos los logs si el usuario es Administrador
    if (user.role === "ADMIN") {
      loadLogs();
    }
  }, [user.role]);

  const loadLogs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error("Error cargando logs");
    }
  };

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: "", type: "" });

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOperator),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({ text: "Operador creado con éxito", type: "success" });
        setNewOperator({ username: "", password: "", role: "RECEPTIONIST" });
        loadLogs(); // Recargamos los logs para ver el registro
      } else {
        setStatusMsg({ text: data.message || "Error al crear", type: "error" });
      }
    } catch (err) {
      setStatusMsg({ text: "Error de conexión", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090910] text-gray-100 p-4 md:p-8 font-sans selection:bg-[#F941A9] selection:text-white">
      <div className="max-w-5xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-[#00E5FF] transition-colors font-bold uppercase text-xs tracking-widest"
          >
            <ArrowLeft size={20} /> <span>Volver al Sistema</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all text-xs uppercase tracking-tighter shadow-lg shadow-red-500/5"
          >
            <LogOut size={18} /> CERRAR SESIÓN
          </button>
        </div>

        {/* El grid cambia según el rol para mantener la estética */}
        <div
          className={`grid grid-cols-1 ${user.role === "ADMIN" ? "md:grid-cols-3" : "md:grid-cols-1 max-w-md mx-auto"} gap-8`}
        >
          {/* COLUMNA IZQUIERDA: TARJETA Y FORMULARIO */}
          <div className="space-y-6">
            {/* TARJETA DE USUARIO ACTUAL */}
            <div className="bg-[#13131F] border border-gray-800 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F941A9] to-transparent"></div>

              <div className="w-24 h-24 bg-[#F941A9]/10 border-2 border-[#F941A9] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(249,65,169,0.2)]">
                <User size={48} className="text-[#F941A9]" />
              </div>

              <h2 className="text-2xl font-black tracking-tighter uppercase text-white">
                {user.username}
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                {user.role === "ADMIN"
                  ? "Administrador Root"
                  : "Operador de Recepción"}
              </p>
            </div>

            {/* FORMULARIO: SOLO VISIBLE SI ERES ADMIN */}
            {user.role === "ADMIN" && (
              <div className="bg-[#13131F] border border-[#00E5FF]/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.05)]">
                <h3 className="text-[#00E5FF] font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                  <Shield size={18} /> Nuevo Acceso
                </h3>

                {statusMsg.text && (
                  <div
                    className={`text-xs p-2 rounded mb-4 font-bold ${statusMsg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}
                  >
                    {statusMsg.text}
                  </div>
                )}

                <form onSubmit={handleCreateOperator} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Usuario"
                    value={newOperator.username}
                    onChange={(e) =>
                      setNewOperator({
                        ...newOperator,
                        username: e.target.value.toLowerCase(),
                      })
                    }
                    className="w-full bg-[#090910] border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-[#00E5FF] outline-none transition-all"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newOperator.password}
                    onChange={(e) =>
                      setNewOperator({
                        ...newOperator,
                        password: e.target.value,
                      })
                    }
                    className="w-full bg-[#090910] border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-[#00E5FF] outline-none transition-all"
                    required
                  />
                  <select
                    value={newOperator.role}
                    onChange={(e) =>
                      setNewOperator({ ...newOperator, role: e.target.value })
                    }
                    className="w-full bg-[#090910] border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-[#00E5FF] outline-none appearance-none transition-all"
                  >
                    <option value="RECEPTIONIST">
                      Recepcionista (Limitado)
                    </option>
                    <option value="ADMIN">Administrador (Root)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00E5FF] hover:bg-[#00c2d6] text-black font-black py-3 rounded-lg transition-all text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/10"
                  >
                    <PlusCircle size={16} />{" "}
                    {loading ? "CREANDO..." : "REGISTRAR OPERADOR"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* 👇 PANEL DE AUDITORÍA: SOLO VISIBLE SI ERES ADMIN */}
          {user.role === "ADMIN" && (
            <div className="md:col-span-2">
              <div className="bg-[#13131F] border border-gray-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-800 bg-[#1A1A24] flex items-center gap-2">
                  <Terminal size={18} className="text-[#00E5FF]" />
                  <h3 className="font-bold text-sm tracking-widest uppercase">
                    Logs de Auditoría
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] custom-scrollbar">
                  {auditLogs.length === 0 ? (
                    <p className="text-gray-600 italic text-center py-10">
                      No hay registros de actividad todavía...
                    </p>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="border-l-2 border-[#00E5FF] pl-4 py-2 bg-[#090910] hover:bg-[#13131F] transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[#F941A9] font-bold">
                            [{log.action}]
                          </span>
                          <span className="text-gray-500 text-[10px]">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300 group-hover:text-white transition-colors">
                          {log.details}
                        </p>
                        <div className="flex gap-4 mt-1 opacity-50">
                          <span className="text-[10px]">USR: {log.user}</span>
                          <span className="text-[10px]">
                            IP: {log.ip || "Local"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
