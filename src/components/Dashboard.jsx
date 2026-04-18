/*eslint-disable*/
import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  AlertTriangle,
  Search,
  PlusCircle,
  CreditCard,
  FileText,
  Printer,
  CheckCircle,
  Save,
  Trash2,
  AlertOctagon,
  Calendar, // 👈 Importamos el nuevo icono para los eventos
} from "lucide-react";

import Navbar from "./Navbar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const Dashboard = ({
  onGoToInventory,
  onGoToRooms,
  onGoToProfile,
  onLogout,
}) => {
  // --- ESTADOS ---
  // 👇 1. Cambiamos lowStock por activeEvents
  const [stats, setStats] = useState({
    members: 0,
    revenue: 0,
    activeEvents: 0,
  });
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    role: "RECEPTIONIST",
  };

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: "",
  });

  const [deletePaymentModal, setDeletePaymentModal] = useState({
    isOpen: false,
    paymentId: null,
    amount: 0,
  });

  const [newMember, setNewMember] = useState({ name: "", email: "" });
  const [newPayment, setNewPayment] = useState({
    memberId: "",
    amount: "",
    concept: "",
  });
  const [file, setFile] = useState(null);
  const [lastPaymentId, setLastPaymentId] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(
        () => setStatusMsg({ text: "", type: "" }),
        4000,
      );
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  useEffect(() => {
    loadData();
  }, []);

  // --- API CALLS ---
  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, membersRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`, { headers }),
        fetch(`${API_BASE}/members`, { headers }),
        fetch(`${API_BASE}/payments`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
    } catch (error) {
      showStatus("Modo Offline: No se pudo conectar al servidor.", "error");
    }
  };

  // --- HELPERS ---
  const showStatus = (text, type = "success") => setStatusMsg({ text, type });

  const filteredPayments = payments.filter(
    (p) =>
      (p.member?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.amount?.toString() || "").includes(searchTerm),
  );

  const filteredMembers = members.filter((m) =>
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- HANDLERS ---
  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMember),
      });
      if (res.ok) {
        setNewMember({ name: "", email: "" });
        loadData();
        setActiveTab("members");
        showStatus("Nuevo miembro registrado.");
      } else {
        showStatus("El correo ya existe en el sistema.", "error");
      }
    } catch (error) {
      showStatus("Error de red al registrar miembro.", "error");
    }
    setLoading(false);
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, memberId: id, memberName: name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, memberId: null, memberName: "" });
  };

  const confirmDeleteMember = async () => {
    const { memberId } = deleteModal;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showStatus("Miembro eliminado.");
        loadData();
      } else {
        showStatus("Error al eliminar el agente.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("Error de conexión.", "error");
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  const openDeletePaymentModal = (id, amount) => {
    setDeletePaymentModal({ isOpen: true, paymentId: id, amount: amount });
  };

  const closeDeletePaymentModal = () => {
    setDeletePaymentModal({ isOpen: false, paymentId: null, amount: 0 });
  };

  const confirmDeletePayment = async () => {
    const { paymentId } = deletePaymentModal;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showStatus("Transacción eliminada con éxito.");
        loadData();
      } else {
        showStatus("Error al intentar borrar el registro.", "error");
      }
    } catch (error) {
      showStatus("Error de conexión al servidor.", "error");
    } finally {
      setLoading(false);
      closeDeletePaymentModal();
    }
  };

  const handleSavePayment = async (e) => {
    if (e) e.preventDefault();

    if (!newPayment.memberId || !newPayment.amount) {
      showStatus("Faltan datos requeridos (Miembro o Monto).", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("memberId", newPayment.memberId);
    formData.append("amount", newPayment.amount);
    formData.append("concept", newPayment.concept);
    if (file) formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setLastPaymentId(data.id);
        loadData();
        setNewPayment({ memberId: "", amount: "", concept: "" });
        setFile(null);
        setActiveTab("transactions");
        showStatus("Transacción completada.");
      } else {
        showStatus("Error al procesar el pago.", "error");
      }
    } catch (error) {
      showStatus("Error crítico al guardar pago.", "error");
    }
    setLoading(false);
  };

  const handlePrint = async (id) => {
    showStatus("Generando ticket...");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/payments/${id}/print`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Acceso denegado");
      const blob = await res.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      showStatus("Error al generar recibo", "error");
    }
  };

  const handlePrintLast = () => {
    if (lastPaymentId) handlePrint(lastPaymentId);
  };

  const handlePrintMembers = async () => {
    showStatus("Generando reporte de personal...");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/members/print`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Acceso denegado");
      const blob = await res.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      showStatus("Error al generar lista", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#090910] text-gray-100 font-sans pb-10 selection:bg-[#F941A9] selection:text-white relative">
      <Navbar
        onGoToInventory={onGoToInventory}
        onGoToDashboard={() => {}}
        onGoToRooms={onGoToRooms}
        onGoToProfile={onGoToProfile}
        currentPage="dashboard"
        onLogout={onLogout}
      />

      {/* --- MODAL MIEMBROS --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeDeleteModal}
          ></div>
          <div className="relative bg-[#13131F] border border-red-500/30 rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-red-500/10 p-4 rounded-full text-red-500">
                <AlertOctagon size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  ¿Eliminar miembro?
                </h3>
                <p className="text-gray-400 text-sm">
                  Estás a punto de eliminar a{" "}
                  <span className="text-red-400 font-bold">
                    {deleteModal.memberName}
                  </span>
                  .
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-bold text-sm"
                >
                  CANCELAR
                </button>
                <button
                  onClick={confirmDeleteMember}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-sm"
                >
                  {loading ? "ELIMINANDO..." : "CONFIRMAR"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PAGOS --- */}
      {deletePaymentModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeDeletePaymentModal}
          ></div>
          <div className="relative bg-[#13131F] border border-red-500/30 rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-red-500/10 p-4 rounded-full text-red-500">
                <AlertOctagon size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  ¿Anular transacción?
                </h3>
                <p className="text-gray-400 text-sm">
                  Estás eliminando un pago de{" "}
                  <span className="text-red-400 font-bold">
                    ${deletePaymentModal.amount}
                  </span>
                  .
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={closeDeletePaymentModal}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-bold text-sm"
                >
                  CANCELAR
                </button>
                <button
                  onClick={confirmDeletePayment}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-sm"
                >
                  {loading ? "ELIMINANDO..." : "CONFIRMAR"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST --- */}
      <div
        className={`fixed top-24 right-6 z-[100] transition-all transform ${statusMsg.text ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none"}`}
      >
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${statusMsg.type === "error" ? "bg-red-500/10 border-red-500 text-red-500" : "bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]"}`}
        >
          {statusMsg.type === "error" ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <span className="font-bold text-sm uppercase tracking-wide">
            {statusMsg.text}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="text-[#00E5FF]" />}
            label="Miembros Activos"
            value={stats.members}
            borderColor="border-[#00E5FF]/30"
            glowColor="shadow-[#00E5FF]/5"
          />
          <StatCard
            icon={<DollarSign className="text-[#F941A9]" />}
            label="Ingresos Totales"
            value={`$${(stats.revenue || 0).toFixed(2)}`}
            borderColor="border-[#F941A9]/30"
            glowColor="shadow-[#F941A9]/5"
          />
          {/* 👇 2. ACTUALIZAMOS LA TARJETA AMARILLA PARA MOSTRAR LOS EVENTOS */}
          <StatCard
            icon={<Calendar className="text-yellow-400" />}
            label="Eventos Registrados"
            value={stats.activeEvents || 0}
            borderColor="border-yellow-400/30"
            glowColor="shadow-yellow-400/5"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#13131F] p-6 rounded-2xl border border-gray-800 shadow-xl group">
              <h3 className="text-[#00E5FF] font-bold mb-5 flex items-center gap-2 uppercase tracking-wider text-sm">
                <PlusCircle size={18} /> Registro
              </h3>
              <form onSubmit={handleRegisterMember} className="space-y-4">
                <InputField
                  placeholder="Nombre completo"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  required
                />
                <InputField
                  placeholder="Correo electrónico"
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                />
                <button
                  disabled={loading}
                  className="w-full border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#090910] font-bold py-3 rounded-lg transition-all uppercase text-xs tracking-widest"
                >
                  {loading ? "Procesando..." : "Ejecutar Registro"}
                </button>
              </form>
            </div>

            <div className="bg-[#13131F] p-6 rounded-2xl border border-gray-800 shadow-xl group">
              <h3 className="text-[#F941A9] font-bold mb-5 flex items-center gap-2 uppercase tracking-wider text-sm">
                <CreditCard size={18} /> Terminal de Pago
              </h3>
              <form onSubmit={handleSavePayment} className="space-y-4">
                <select
                  className="w-full bg-[#090910] border border-gray-700 text-gray-300 p-3 rounded-lg text-sm focus:border-[#F941A9] outline-none appearance-none"
                  value={newPayment.memberId}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, memberId: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar Miembro...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    type="number"
                    placeholder="Monto ($)"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    required
                  />
                  <InputField
                    type="text"
                    placeholder="Concepto"
                    value={newPayment.concept}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, concept: e.target.value })
                    }
                  />
                </div>
                <div className="relative border-2 border-dashed border-gray-800 rounded-xl p-4 text-center hover:border-[#F941A9]/50 cursor-pointer group/file">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*,.pdf"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileText
                      size={20}
                      className={
                        file
                          ? "text-[#F941A9]"
                          : "text-gray-600 group-hover/file:text-gray-400"
                      }
                    />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                      {file ? file.name : "Adjuntar Comprobante (IMG/PDF)"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#F941A9] hover:bg-[#d63690] text-white font-bold py-3 rounded-lg transition-all text-xs uppercase tracking-widest shadow-lg shadow-[#F941A9]/20"
                  >
                    {Save && <Save size={16} />} Cobrar
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintLast}
                    disabled={!lastPaymentId}
                    className="flex items-center justify-center gap-2 border border-[#00E5FF] text-[#00E5FF] font-bold py-3 rounded-lg transition-all text-xs uppercase tracking-widest disabled:opacity-20"
                  >
                    <Printer size={16} /> Recibo
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#13131F] rounded-2xl border border-gray-800 shadow-2xl flex flex-col h-full max-h-[800px]">
              <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex gap-1 bg-[#090910] p-1 rounded-lg border border-gray-800">
                    <TabBtn
                      active={activeTab === "transactions"}
                      onClick={() => setActiveTab("transactions")}
                      icon={<FileText size={14} />}
                      label="Transacciones"
                    />
                    <TabBtn
                      active={activeTab === "members"}
                      onClick={() => setActiveTab("members")}
                      icon={<Users size={14} />}
                      label="Miembros"
                    />
                  </div>

                  {activeTab === "members" && (
                    <button
                      onClick={handlePrintMembers}
                      className="flex items-center gap-2 bg-[#00E5FF]/10 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#090910] px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,229,255,0.1)] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    >
                      <Printer size={16} /> Imprimir Lista
                    </button>
                  )}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full bg-[#090910] border border-gray-800 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:border-[#F941A9] outline-none transition-all placeholder:text-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1A1A24] text-xs uppercase text-gray-400 font-bold sticky top-0 z-10">
                    {activeTab === "transactions" ? (
                      <tr>
                        <th className="p-4">Ref</th>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4 text-right">Monto</th>
                        <th className="p-4 text-center">Acción</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Contacto</th>
                        <th className="p-4 text-center">Estado / Acciones</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-800/50">
                    {activeTab === "transactions" ? (
                      filteredPayments.length > 0 ? (
                        filteredPayments.map((p) => (
                          <tr
                            key={p.id}
                            className="group hover:bg-[#F941A9]/5 transition-colors"
                          >
                            <td className="p-4 text-gray-500 font-mono text-xs">
                              #{p.id.toString().padStart(4, "0")}
                            </td>
                            <td className="p-4 font-medium text-white">
                              {p.member?.name}
                            </td>
                            <td className="p-4 text-gray-400 text-xs">
                              {new Date(p.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right font-bold text-[#F941A9]">
                              ${Number(p.amount).toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {p.receiptUrl && (
                                  <button
                                    onClick={() =>
                                      window.open(p.receiptUrl, "_blank")
                                    }
                                    className="text-[#00E5FF] hover:bg-[#00E5FF]/10 p-2 rounded-full animate-pulse"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handlePrint(p.id)}
                                  className="text-gray-600 hover:text-[#00E5FF] p-2 rounded-full"
                                >
                                  <Printer size={18} />
                                </button>
                                {currentUser.role === "ADMIN" && (
                                  <button
                                    onClick={() =>
                                      openDeletePaymentModal(p.id, p.amount)
                                    }
                                    className="text-gray-600 hover:text-red-500 p-2 rounded-full"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-8 text-center text-gray-500 italic"
                          >
                            No hay transacciones registradas.
                          </td>
                        </tr>
                      )
                    ) : (
                      filteredMembers.map((m) => (
                        <tr
                          key={m.id}
                          className="group hover:bg-[#00E5FF]/5 transition-colors"
                        >
                          <td className="p-4 text-gray-500 font-mono text-xs">
                            #{m.id}
                          </td>
                          <td className="p-4 font-bold text-gray-200">
                            {m.name}
                          </td>
                          <td className="p-4 text-gray-400 text-xs">
                            {m.email || "N/A"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                                {m.status || "Activo"}
                              </span>
                              {currentUser.role === "ADMIN" && (
                                <button
                                  onClick={() => openDeleteModal(m.id, m.name)}
                                  className="text-gray-600 hover:text-red-500 p-1.5 rounded-md"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ ...props }) => (
  <input
    className="w-full bg-[#090910] border border-gray-700 text-gray-200 p-3 rounded-lg text-sm focus:border-[#F941A9] outline-none transition-all placeholder:text-gray-600"
    {...props}
  />
);
const StatCard = ({ icon, label, value, borderColor, glowColor }) => (
  <div
    className={`bg-[#13131F] p-6 rounded-2xl border ${borderColor} flex items-center gap-5 shadow-xl ${glowColor} transition-transform hover:-translate-y-1`}
  >
    <div className="p-4 bg-[#090910] rounded-xl border border-gray-800 shadow-inner">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);
const TabBtn = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase tracking-wider ${active ? "bg-[#1A1A24] text-white" : "text-gray-500 hover:text-gray-300"}`}
  >
    {icon} {label}
  </button>
);

export default Dashboard;
