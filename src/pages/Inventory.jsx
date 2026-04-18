/*eslint-disable*/
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Layers,
  Search,
  ArrowLeft,
  Printer,
  Calendar,
  ShoppingCart,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const Inventory = ({ onBack }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(false);

  // Formularios
  const [newEventName, setNewEventName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showCatModal, setShowCatModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    categoryId: "",
    quantity: 1,
    unitCost: 0,
  });

  const loadInitialData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [eventsRes, catsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/events`, { headers }),
        fetch(`${API_BASE}/events/categories`, { headers }),
        fetch(`${API_BASE}/stats`, { headers }),
      ]);

      if (eventsRes.ok) {
        const evData = await eventsRes.json();
        setEvents(evData);
        setSelectedEventId((prevId) => {
          if (!prevId && evData.length > 0) return evData[0].id;
          return prevId;
        });
      }
      if (catsRes.ok) setCategories(await catsRes.json());
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setTotalRevenue(stats.revenue || 0);
      }
    } catch (error) {
      console.error("Error inicial:", error);
    }
  };

  const loadExpenses = async () => {
    if (!selectedEventId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE}/events/${selectedEventId}/expenses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setExpenses(await res.json());
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
    if (selectedEventId) {
      loadExpenses();
    }
  }, [selectedEventId]);

  const currentEventExpensesTotal = expenses.reduce(
    (acc, exp) => acc + exp.quantity * exp.unitCost,
    0,
  );
  const remainingBudget = totalRevenue - currentEventExpensesTotal;

  // --- ACCIONES ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newEventName }),
    });
    if (res.ok) {
      setNewEventName("");
      loadInitialData();
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/events/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCatName }),
    });
    setNewCatName("");
    loadInitialData();
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/events/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...expenseForm, eventId: selectedEventId }),
    });
    setExpenseForm({ name: "", categoryId: "", quantity: 1, unitCost: 0 });
    setShowExpenseModal(false);
    setLoading(false);
    loadExpenses();
  };

  const handleDeleteExpense = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/events/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadExpenses();
  };

  const handlePrintReport = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/events/${selectedEventId}/print`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="min-h-screen bg-[#090910] text-white p-4 sm:p-6 lg:p-8 font-sans">
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-[#00E5FF] shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase truncate">
            Presupuesto de <span className="text-[#00E5FF]">Eventos</span>
          </h1>
        </div>
        <button
          onClick={() => setShowCatModal(true)}
          className="w-full sm:w-auto border border-[#00E5FF] text-[#00E5FF] px-4 py-3 sm:py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm uppercase"
        >
          <Layers size={16} /> Categorías
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#13131F] border border-gray-800 p-5 rounded-2xl">
            <h3 className="text-[#F941A9] font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar size={18} /> Seleccionar Evento
            </h3>
            <select
              className="w-full bg-[#090910] border border-gray-700 p-3 rounded-lg text-white outline-none focus:border-[#F941A9] mb-4"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>

            <form onSubmit={handleCreateEvent} className="flex gap-2">
              <input
                className="w-full bg-[#090910] border border-gray-700 p-3 sm:p-2 rounded-lg text-sm outline-none"
                placeholder="Nuevo evento..."
                required
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
              />
              <button className="bg-[#00E5FF] text-black px-4 sm:px-3 rounded-lg font-bold shrink-0">
                <Plus size={18} />
              </button>
            </form>
          </div>

          <div className="bg-[#13131F] border border-gray-800 p-5 rounded-2xl space-y-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Caja Fuerte (Ingresos)
              </p>
              <p className="text-2xl font-black text-white">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Costo de este Evento
              </p>
              <p className="text-2xl font-black text-red-400">
                -${currentEventExpensesTotal.toFixed(2)}
              </p>
            </div>
            <div className="border-t border-gray-800 pt-4">
              <p className="text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
                Disponible
              </p>
              <p
                className={`text-3xl font-black ${remainingBudget < 0 ? "text-red-500" : "text-[#00E5FF]"}`}
              >
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABLA RESPONSIVA */}
        <div className="lg:col-span-3 bg-[#13131F] border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-bold uppercase">
              Gastos del Evento
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handlePrintReport}
                disabled={!selectedEventId}
                className="w-full sm:w-auto border border-[#F941A9] text-[#F941A9] hover:bg-[#F941A9] hover:text-white px-4 py-3 sm:py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Printer size={16} /> Reporte PDF
              </button>
              <button
                onClick={() => setShowExpenseModal(true)}
                disabled={!selectedEventId}
                className="w-full sm:w-auto bg-[#F941A9] text-white px-4 py-3 sm:py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-[#d63690] transition-colors disabled:opacity-50"
              >
                <Plus size={16} /> Agregar Gasto
              </button>
            </div>
          </div>

          <div className="overflow-x-auto p-4 custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="text-xs uppercase text-gray-500 font-bold border-b border-gray-800">
                <tr>
                  <th className="pb-3">Producto / Servicio</th>
                  <th className="pb-3">Categoría</th>
                  <th className="pb-3 text-center">Cant.</th>
                  <th className="pb-3 text-right">Costo U.</th>
                  <th className="pb-3 text-right text-[#00E5FF]">Subtotal</th>
                  <th className="pb-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-8 text-center text-gray-500 italic"
                    >
                      No hay gastos para este evento.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/5">
                      <td className="py-4 font-bold text-gray-200">
                        {exp.name}
                      </td>
                      <td className="py-4">
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">
                          {exp.category?.name}
                        </span>
                      </td>
                      <td className="py-4 text-center">{exp.quantity}</td>
                      <td className="py-4 text-right font-mono text-gray-400">
                        ${exp.unitCost.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-bold text-[#00E5FF] font-mono">
                        ${(exp.quantity * exp.unitCost).toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-gray-500 hover:text-red-500 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALES IGUALES PERO CON PADDING AJUSTADO... */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13131F] border border-gray-700 p-6 rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in">
            <h2 className="text-xl font-bold mb-4 uppercase text-[#F941A9] flex items-center gap-2">
              <ShoppingCart size={20} /> Registrar Gasto
            </h2>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <input
                className="w-full bg-[#090910] border border-gray-700 p-3 rounded-lg text-white"
                placeholder="Ej: Equipo de Sonido"
                value={expenseForm.name}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, name: e.target.value })
                }
                required
              />
              <select
                className="w-full bg-[#090910] border border-gray-700 p-3 rounded-lg text-white"
                value={expenseForm.categoryId}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, categoryId: e.target.value })
                }
                required
              >
                <option value="">Selecciona Categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  className="bg-[#090910] border border-gray-700 p-3 rounded-lg"
                  placeholder="Cantidad"
                  value={expenseForm.quantity}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, quantity: e.target.value })
                  }
                  required
                  min="1"
                />
                <input
                  type="number"
                  step="0.01"
                  className="bg-[#090910] border border-gray-700 p-3 rounded-lg"
                  placeholder="Costo Unitario ($)"
                  value={expenseForm.unitCost}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, unitCost: e.target.value })
                  }
                  required
                  min="0"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-3 border border-gray-700 rounded-lg font-bold"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#F941A9] text-white rounded-lg font-bold"
                >
                  {loading ? "GUARDANDO..." : "AGREGAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13131F] border border-[#00E5FF]/30 p-6 rounded-2xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-[#00E5FF] flex items-center gap-2">
              <Layers size={20} /> Categorías
            </h3>
            <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
              <input
                className="flex-1 bg-[#090910] border border-gray-700 p-3 sm:p-2 rounded-lg outline-none text-sm"
                placeholder="Ej: Comida..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-[#00E5FF] text-black px-4 rounded-lg font-bold shrink-0"
              >
                <Plus size={18} />
              </button>
            </form>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#090910] p-3 rounded-lg border border-gray-800 text-sm text-gray-300"
                >
                  {c.name}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCatModal(false)}
              className="w-full mt-4 py-3 border border-gray-700 rounded-lg font-bold text-gray-400"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
