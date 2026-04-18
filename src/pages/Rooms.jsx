/*eslint-disable*/
import React, { useState, useEffect, useCallback } from "react";
import { Bed, Users, Printer, Plus, Trash2, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const Rooms = ({ onBack }) => {
  const [rooms, setRooms] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Formulario
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [roomsRes, membersRes] = await Promise.all([
        fetch(`${API_BASE}/rooms`, { headers }),
        fetch(`${API_BASE}/members`, { headers }),
      ]);
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (membersRes.ok) {
        const allMembers = await membersRes.json();
        setAvailableMembers(allMembers.filter((m) => m.roomId === null));
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: roomName,
        capacity,
        memberIds: selectedMembers,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setRoomName("");
      setSelectedMembers([]);
      loadData();
    }
  };

  const handleDeleteRoom = async (id, name) => {
    if (
      window.confirm(
        `¿Eliminar la ${name}? Los miembros no se borrarán, solo quedarán sin asignar.`,
      )
    ) {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    }
  };

  const toggleMemberSelection = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const handlePrintAllRooms = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/rooms/print`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Acceso denegado");
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (error) {
      alert("Error al generar el reporte global de habitaciones.");
    }
  };

  const handlePrintSingleRoom = async (roomId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/print`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Acceso denegado");
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (error) {
      alert("Error al generar el reporte de la habitación.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090910] text-white p-4 sm:p-6 lg:p-8 font-sans">
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-all shrink-0"
          >
            <ArrowLeft size={24} className="text-[#00E5FF]" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-2 sm:gap-3 truncate">
            <Bed className="text-[#00E5FF] shrink-0" size={28} />
            <span className="truncate">
              Asignación{" "}
              <span className="text-[#00E5FF] hidden sm:inline">
                Habitaciones
              </span>
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handlePrintAllRooms}
            className="w-full sm:w-auto justify-center border border-[#F941A9] text-[#F941A9] hover:bg-[#F941A9] hover:text-white px-4 py-3 sm:py-2 rounded-lg font-bold flex items-center gap-2 transition-all text-sm"
          >
            <Printer size={16} /> REPORTE GLOBAL
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto justify-center bg-[#00E5FF] hover:bg-[#00c2d6] text-black px-4 py-3 sm:py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] text-sm"
          >
            <Plus size={18} /> NUEVA HABITACIÓN
          </button>
        </div>
      </div>

      {/* GRID DE HABITACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-[#13131F] border border-gray-800 rounded-2xl p-6 relative group overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 flex gap-2 bg-[#13131F]/80 backdrop-blur-sm rounded-bl-2xl">
              <button
                onClick={() => handlePrintSingleRoom(room.id)}
                className="text-gray-500 hover:text-[#00E5FF] transition-colors p-2"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={() => handleDeleteRoom(room.id, room.name)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-[#00E5FF] mb-2 uppercase pr-20 truncate">
              {room.name}
            </h3>

            <p className="text-xs text-gray-500 font-bold mb-4 flex items-center gap-1">
              <Users size={14} /> CAPACIDAD: {room.members?.length || 0} /{" "}
              {room.capacity}
            </p>

            <div className="bg-[#090910] rounded-xl p-4 min-h-[120px] border border-gray-800/50 custom-scrollbar overflow-y-auto max-h-[200px]">
              {!room.members || room.members.length === 0 ? (
                <p className="text-gray-600 text-sm italic text-center mt-6">
                  Habitación vacía
                </p>
              ) : (
                <ul className="space-y-3">
                  {room.members.map((m) => (
                    <li
                      key={m.id}
                      className="text-sm font-medium text-gray-300 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F941A9] shrink-0"></span>{" "}
                      <span className="truncate">{m.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR HABITACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13131F] border border-gray-700 p-6 sm:p-8 rounded-t-3xl sm:rounded-3xl w-full max-w-lg animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in">
            <h2 className="text-xl sm:text-2xl font-black mb-6 uppercase">
              Armar <span className="text-[#00E5FF]">Habitación</span>
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  className="sm:col-span-2 bg-[#090910] border border-gray-700 p-4 sm:p-3 rounded-xl outline-none focus:border-[#00E5FF] text-sm"
                  placeholder="Nombre (Ej: Suite A)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="bg-[#090910] border border-gray-700 p-4 sm:p-3 rounded-xl outline-none focus:border-[#00E5FF] text-sm"
                  placeholder="Cap."
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  required
                  min="1"
                />
              </div>

              <div className="border border-gray-700 rounded-xl p-4 bg-[#090910] max-h-48 overflow-y-auto custom-scrollbar">
                <p className="text-xs font-bold text-gray-500 mb-3">
                  SELECCIONAR PARTICIPANTES:
                </p>
                {availableMembers.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">
                    Todos ya tienen cuarto.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {availableMembers.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-3 cursor-pointer p-3 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(m.id)}
                          onChange={() => toggleMemberSelection(m.id)}
                          disabled={
                            !selectedMembers.includes(m.id) &&
                            selectedMembers.length >= capacity
                          }
                          className="accent-[#00E5FF] w-5 h-5 sm:w-4 sm:h-4 shrink-0"
                        />
                        <span className="text-sm text-gray-300 truncate">
                          {m.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 sm:py-3 border border-gray-700 rounded-xl font-bold hover:bg-gray-800 transition-colors text-sm"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 sm:py-3 bg-[#00E5FF] text-black rounded-xl font-bold hover:bg-[#00c2d6] transition-colors text-sm"
                >
                  CREAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
